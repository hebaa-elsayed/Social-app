import { Request, Response } from "express";
import { BadRequestException, S3ClientService, SuccessResponse } from "../../../Utils";
import { FriendshipStatusEnum, IFriendship, IRequest, IUser } from "../../../Common";
import { FriendshipRepository, UserRepository } from "../../../DB/Repositories";
import { UserModel } from "../../../DB/Models";
import mongoose, { FilterQuery, Types } from "mongoose";


export class ProfileService{


    private s3Client = new S3ClientService()
    private userRepo = new UserRepository(UserModel)
    private friendshipRepo = new FriendshipRepository()


    uploadProfilePicture = async (req:Request, res:Response)=> {
        const { file } = req
        const {user} = (req as unknown as IRequest).loggedInUser
        
        if(!file) throw new BadRequestException('Please upload a file')

        const {key, url}= await this.s3Client.uploadFileOnS3(file, `${user._id}/profile`)
    
        user.profilePicture = key
        await user.save()

        res.json(SuccessResponse<unknown>('Profile picture uploaded successfuly', 200,{key, url}))
    }


    renewSignedUrl = async (req:Request, res:Response)=> {
        const {user} = (req as unknown as IRequest).loggedInUser
        const {key, keyType} : {key: string, keyType: 'profilePicture' | 'coverPicture'} = req.body  //profilePicture or coverPicture == key

        if (user[keyType] !== key) throw new BadRequestException('Invalid key')
        
        const url = await this.s3Client.getFileWithSignedUrl(key)
        res.json(SuccessResponse<unknown>('Signed url renewed successfuly', 200,{ key, url}))
    }


    deleteAccount = async (req:Request, res:Response)=> {
        const {user} = (req as unknown as IRequest).loggedInUser
        const deletedDocument = await this.userRepo.deleteByIdDocument(user._id as mongoose.Schema.Types.ObjectId)
        if(!deletedDocument) throw new BadRequestException('User not found')
        // const deletedResponse = await this.s3Client.deleteFileFromS3(deletedDocument?.profilePicture as string)
        res.json(SuccessResponse<unknown>('Account deleted successfuly', 200))
    }

    // uploadLargeProfilePicture = async (req:Request, res:Response)=> {
    //     const { file } = req
    //     const {user} = (req as unknown as IRequest).loggedInUser
        
    //     if(!file) throw new BadRequestException('Please upload a file')

    //     const uploaded = await this.s3Client.uploadLargeFileOnS3(file, `${user._id}/profile`)
    
    //     // user.profilePicture = key
    //     // await user.save()

    //     res.json(SuccessResponse<unknown>('Profile picture uploaded successfuly', 200,uploaded))
    // }

    updateProfile = async (req:Request, res:Response)=> {
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const {firstName, lastName, email, password, phoneNumber, gender, DOB}:IUser = req.body

        await this.userRepo.updateOneDocument(
            {_id },
            {$set:{firstName, lastName, email, password, phoneNumber, gender, DOB}},
            {new:true}
        )
        res.json(SuccessResponse<IUser>('Profile updated successfuly', 200))
    }


    getProfile = async (req:Request, res:Response)=> {
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const user = await this.userRepo.findDocumentById(_id as mongoose.Schema.Types.ObjectId)
        if (!user) throw new BadRequestException('User not found')
        res.json(SuccessResponse<IUser>('Profile fetched successfuly', 200, user))
    }

    
    listUsers = async (req:Request, res:Response)=> {
        const users = await this.userRepo.findDocuments()
        res.json(SuccessResponse<IUser[]>('Users fetched successfuly', 200, users))
    }

    uploadCoverPicture = async (req:Request, res:Response)=> {
        const { file } = req
        const {user} = (req as unknown as IRequest).loggedInUser
        
        if(!file) throw new BadRequestException('Please upload a file')

        const {key, url}= await this.s3Client.uploadFileOnS3(file, `${user._id}/cover`)
    
        user.coverPicture = key
        await user.save()

        res.json(SuccessResponse<unknown>('Cover picture uploaded successfuly', 200,{key, url}))
    }

    sendFriendshipRequest = async (req:Request, res:Response)=> {
        const {user:{_id}} = (req as IRequest).loggedInUser
        if(!_id) throw new BadRequestException('User not found')
        const {requestToId} = req.body
        const user = await this.userRepo.findDocumentById(requestToId)
        if (!user) throw new BadRequestException('User not found')

        await this.friendshipRepo.createNewDocument({requestFromId:_id, requestToId})
        res.json(SuccessResponse<IUser>('Friendship request sent successfuly', 200))
    }

    listRequests = async (req:Request, res:Response)=> {
        const {user:{_id}} = (req as IRequest).loggedInUser
        const { status } = req.query

        const filters: FilterQuery<IFriendship> = { status: status? status:FriendshipStatusEnum.PENDING }
        if(status === FriendshipStatusEnum.ACCEPTED) filters.$or = [{requestToId:_id}, {requestFromId:_id}]
        else filters.requestToId = _id
        
        const requests = await this.friendshipRepo.findDocuments(
            filters, 
            undefined, 
            {populate:[
                {
                    path:'requestFromId', 
                    select:'firstName lastName profilePicture'
                }, 
                {
                    path:'requestToId', 
                    select:'firstName lastName profilePicture'
                }
            ]})
            
        res.json(SuccessResponse<IFriendship[]>('Requests fetched successfuly', 200, requests))
    }

    respondToFriendshipRequest = async (req:Request, res:Response)=> {
        const {user:{_id}} = (req as IRequest).loggedInUser
        const {friendRequestId, response} = req.body

        const friendRequest = await this.friendshipRepo.findOneDocument({_id:friendRequestId, requestToId:_id ,status:FriendshipStatusEnum.PENDING})
        if (!friendRequest) throw new BadRequestException('Friend request not found')

        friendRequest.status = response
        await friendRequest.save()

        res.json(SuccessResponse<IFriendship>('Friend request responded successfuly', 200, friendRequest))
    }

}



export default new ProfileService()