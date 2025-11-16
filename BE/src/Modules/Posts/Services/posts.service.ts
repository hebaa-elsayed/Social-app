import { NextFunction, Request, Response } from "express"
import { PostRepository, UserRepository, FriendshipRepository, CommentRepository, ReactRepository } from "../../../DB/Repositories"
import { UserModel } from "../../../DB/Models"
import { FriendshipStatusEnum, IRequest } from "../../../Common"
import { BadRequestException, S3ClientService, pagination, extractTags } from "../../../Utils"
import mongoose from "mongoose"
import sendEmailService from "../../../Utils/Services/send-email-service.utils"


class PostService {
    private postRepo = new PostRepository()
    private userRepo = new UserRepository(UserModel)
    private friendshipRepo = new FriendshipRepository()
    private S3ClientService = new S3ClientService()
    private commentRepo = new CommentRepository()
    private reactRepo = new ReactRepository()

    addPost= async (req:Request, res:Response, next:NextFunction)=>{
        const {user:{_id}} = (req as IRequest).loggedInUser
        const {description, allowComments, tags} = req.body
        const files = req.files as Express.Multer.File[]

        if(!description && (files && !files.length)) throw new BadRequestException("Description or files are required")
        
        let uniqueTags: string[] = []  
        if(tags){
            const users = await this.userRepo.findDocuments({_id: {$in: tags}})
            if(users.length !== tags.length) throw new BadRequestException("Invalid tags===")
        
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
        
        if(tags.length > 0){
            const taggedUsers = await this.userRepo.findDocuments({_id: {$in: tags}})
            const emails = taggedUsers.map((u) => u.email)
            await sendEmailService.sendTaggedEmail(emails, `${process.env.FRONTEND_URL}/posts/${post._id}`)   
        }
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

    freezePost = async (req:Request, res:Response, next:NextFunction)=>{
        const {user:{_id}} = (req as IRequest).loggedInUser
        const {postId} = req.params
        if(!postId) throw new BadRequestException('Invalid post id')
        const post = await this.postRepo.findDocumentById(postId)
        if(!post) throw new BadRequestException('Post not found')
        if(post.ownerId.toString() !== _id.toString()) throw new BadRequestException('You are not authorized to freeze this post')
        const frozenPost = await this.postRepo.freezeDocumentById(postId)
        return res.status(200).json({success:true, message:"Post frozen successfully", data: frozenPost})
    }
    
   hardDeletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { user: { _id } } = (req as unknown as IRequest).loggedInUser;

    if (!mongoose.Types.ObjectId.isValid(postId))
        throw new BadRequestException("Invalid post id");

    const post = await this.postRepo.findDocumentById(postId);
    if (!post) throw new BadRequestException("Post not found");

    if (post.ownerId.toString() !== _id.toString())
        throw new BadRequestException("You are not authorized to delete this post");

    if (post.attachments) {
        await this.S3ClientService.deleteBulkFilesFromS3(post.attachments);
    }

    await this.reactRepo.deleteDocuments({ refId: postId, onModel: "Post" });

    const comments = await this.commentRepo.findDocuments({ refId: postId, onModel: "Post" });
    for (const comment of comments) {
        await this.reactRepo.deleteDocuments({ refId: comment._id, onModel: "Comment" });

        const replies = await this.commentRepo.findDocuments({ refId: comment._id, onModel: "Comment" });
        for (const reply of replies) {
            await this.reactRepo.deleteDocuments({ refId: reply._id, onModel: "Comment" });
            if (reply.attachment) await this.S3ClientService.deleteFileFromS3(reply.attachment);
            await this.commentRepo.deleteByIdDocument(reply._id);
        }

        if (comment.attachment) await this.S3ClientService.deleteFileFromS3(comment.attachment);
        await this.commentRepo.deleteByIdDocument(comment._id);
    }

    await this.postRepo.deleteByIdDocument(postId);

    return res.status(200).json({success:true, message:"Post and all related data deleted successfully", data: post});
    }


}

export default new PostService()
