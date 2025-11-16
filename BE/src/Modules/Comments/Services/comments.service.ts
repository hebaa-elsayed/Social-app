import { CommentRepository , UserRepository, ReactRepository} from "../../../DB/Repositories"
import { UserModel } from "../../../DB/Models"
import { BadRequestException, SuccessResponse , S3ClientService} from "../../../Utils"
import { Request, Response } from "express"
import { IRequest } from "../../../Common"
import mongoose from "mongoose"

class CommentService{
    private commentRepo = new CommentRepository()
    private s3Service = new S3ClientService()
    private reactRepo = new ReactRepository()
    private userRepo = new UserRepository(UserModel)

    createComment = async (req:Request, res:Response)=>{
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const {content, refId, onModel} = req.body
        let attachment:string | undefined = undefined
        if(req.file){
            const uploaded = await this.s3Service.uploadFileOnS3(req.file, 'comments')
            attachment = uploaded.url
        }
        if(!['Post', 'Comment'].includes(onModel)) throw new BadRequestException('Invalid model')

        const newComment = await this.commentRepo.createNewDocument({content,attachment, refId, onModel, ownerId: _id})
        
        return res.status(201).json(SuccessResponse('Comment created successfully', 201, newComment))
    }

    updateComment = async (req:Request, res:Response)=>{
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const {commentId} = req.params
        const {content} = req.body
        let attachment:string | undefined = undefined
       
        if(!mongoose.Types.ObjectId.isValid(commentId)) throw new BadRequestException('Invalid comment id')
        const comment = await this.commentRepo.findDocumentById(commentId)
        if(!comment) throw new BadRequestException('Comment not found')
        
            if(req.file){
            const uploaded = await this.s3Service.uploadFileOnS3(req.file, 'comments')
            attachment = uploaded.url
        }
        
        if(comment.ownerId.toString() !== _id.toString()) throw new BadRequestException('You are not authorized to update this comment')

        comment.content = content ?? comment.content
        comment.attachment = attachment || comment.attachment
        await comment.save()
        
        return res.status(200).json(SuccessResponse('Comment updated successfully', 200, comment))
    }

    getComment = async (req:Request, res:Response)=>{
        const {commentId} = req.params
        if(!mongoose.Types.ObjectId.isValid(commentId)) throw new BadRequestException('Invalid comment id')
        const comment = await this.commentRepo.findDocumentById(commentId)
        if(!comment) throw new BadRequestException('Comment not found')
        return res.status(200).json(SuccessResponse('Comment fetched successfully', 200, comment))
    }

    getCommentWithReplies = async (req:Request, res:Response)=>{
        const {commentId} = req.params
        if(!mongoose.Types.ObjectId.isValid(commentId)) throw new BadRequestException('Invalid comment id')
        const comment = await this.commentRepo.findDocumentById(commentId)
        if(!comment) throw new BadRequestException('Comment not found')

        const replies = await this.commentRepo.findDocuments({refId: commentId, onModel: 'Comment'})

        return res.status(200).json(SuccessResponse('Comment fetched successfully', 200, {comment, replies}))
    }

    hardDeleteComment = async (req:Request, res:Response)=>{
        const {commentId} = req.params
        if(!mongoose.Types.ObjectId.isValid(commentId)) throw new BadRequestException('Invalid comment id')
        const comment = await this.commentRepo.findDocumentById(commentId)
        if(!comment) throw new BadRequestException('Comment not found')
       
        if(comment.attachment){
            await this.s3Service.deleteFileFromS3(comment.attachment)
        }
        await this.reactRepo.deleteDocuments({refId: commentId, onModel: 'Comment'})
        await this.commentRepo.deleteDocuments({refId: commentId, onModel: 'Comment'})
        await this.commentRepo.deleteByIdDocument(commentId)
        
        return res.status(200).json(SuccessResponse('Comment deleted permanently', 200))
    }

    freezeComment = async (req:Request, res:Response)=>{
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const {commentId} = req.params
        if(!mongoose.Types.ObjectId.isValid(commentId)) throw new BadRequestException('Invalid comment id')
        const comment = await this.commentRepo.findDocumentById(commentId)
        if(!comment) throw new BadRequestException('Comment not found')
        if(comment.ownerId.toString() !== _id.toString()) throw new BadRequestException('You are not authorized to freeze this comment')
        const frozenComment = await this.commentRepo.freezeDocumentById(commentId)
        return res.status(200).json(SuccessResponse('Comment frozen successfully', 200, frozenComment))
    }

}

export default new CommentService()
