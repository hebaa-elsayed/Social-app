import { NextFunction, Request, Response } from "express"
import { PostRepository, UserRepository, FriendshipRepository } from "../../../DB/Repositories"
import { UserModel } from "../../../DB/Models"
import { FriendshipStatusEnum, IRequest } from "../../../Common"
import { BadRequestException, S3ClientService, pagination } from "../../../Utils"



class PostService {
    private postRepo = new PostRepository()
    private userRepo = new UserRepository(UserModel)
    private friendshipRepo = new FriendshipRepository()
    private S3ClientService = new S3ClientService()

    addPost= async (req:Request, res:Response, next:NextFunction)=>{
        const {user:{_id}} = (req as IRequest).loggedInUser
        const {description, allowComments, tags} = req.body
        const files = req.files as Express.Multer.File[]

        if(!description && (files && !files.length)) throw new BadRequestException("Description or files are required")
        
        let uniqueTags: string[] = []  
        if(tags){
            const users = await this.userRepo.findDocuments({_id: {$in: tags}})
            if(users.length !== tags.length) throw new BadRequestException("Invalid tags")
        
            const friends = await this.friendshipRepo.findDocuments({
                status:FriendshipStatusEnum.ACCEPTED, 
                $or:[
                    {requestFromId: _id, requestToId: {$in: tags}},
                    {requestToId: _id, requestFromId: {$in: tags}}
                ]
           })
           if (friends.length !== tags.length) throw new BadRequestException("Invalid tags")
            
            uniqueTags = Array.from(new Set(tags))
        }   

        let attachments: string[] = []
        if(files?.length){
            const uploadedData = await this.S3ClientService.uploadFilesOnS3(files, `${_id}/posts`)
            attachments = uploadedData.map(({ key })=>(key))
        }

        const post = await this.postRepo.createNewDocument({
            description,
            attachments,
            ownerId: _id,
            allowComments,
            tags: uniqueTags   
        })
        return res.status(201).json({success:true, message:"Post added successfully", data: post})
    }

    listHomePosts = async (req:Request, res:Response, next:NextFunction)=>{
        const {page, limit} = req.query
        
        const {skip, limit: currentLimit} = pagination({page: Number(page), limit: Number(limit)})
        
        // const posts = await this.postRepo.findDocuments({ ownerId: {$ne: _id} }, {}, {skip, limit: Number(currentLimit)})
        // const totalPages = (await this.postRepo.countDocuments()) / Number(limit)
        
        const posts = await this.postRepo.postsPagination({
            // attachments: {$ne: []}
        }, {
            // select: 'description', 
            page: Number(page),
            limit: Number(currentLimit),
            customLabels: {
                docs: 'posts',
                totalDocs: 'totalPosts',
                limit: 'limit',
                page: 'currentPage',
                totalPages: 'totalPages',
                pagingCounter: 'pagingCounter',
                hasPrevPage: 'hasPrevPage',
                hasNextPage: 'hasNextPage',
                prevPage: 'prevPage',
                nextPage: 'nextPage',
                meta: 'meta'
            },
            populate:[
                {
                    path: 'ownerId',
                    select: 'firstNmae lastName'
                }
            ]

        })

        return res.status(200).json({
            success:true, 
            message:"Posts fetched successfully", 
            data: {posts}
        })
    }

    


}

export default new PostService()
