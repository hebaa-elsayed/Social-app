import { Request, Response } from "express";
import { BadRequestException, S3ClientService, SuccessResponse } from "../../../Utils";
import { IRequest } from "../../../Common";
import { UserRepository } from "../../../DB/Repositories";
import { UserModel } from "../../../DB/Models";
import mongoose from "mongoose";


export class ProfileService{


    private s3Client = new S3ClientService()
    private userRepo = new UserRepository(UserModel)

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
        const deletedResponse = await this.s3Client.deleteFileFromS3(deletedDocument?.profilePicture as string)
        res.json(SuccessResponse<unknown>('Account deleted successfuly', 200, deletedResponse))
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


    
}



export default new ProfileService()