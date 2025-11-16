import { Router } from "express";
import { authentication, Multer, blockCheckMiddleware } from "../../Middleware";
import CommentService from "./Services/comments.service";
const commentController = Router();

//  create comment
commentController.post('/create-comment', authentication,blockCheckMiddleware,Multer().single('attachment'), CommentService.createComment)
//  Update comment
commentController.put('/update-comment/:commentId', authentication,blockCheckMiddleware,Multer().single('attachment'), CommentService.updateComment)
//  Get comment by id
commentController.get('/get-comment-by-id/:commentId', authentication,blockCheckMiddleware, CommentService.getComment)
//  Get comment with replies
commentController.get('/get-comment-with-replies/:commentId', authentication,blockCheckMiddleware, CommentService.getCommentWithReplies)
//  Hard delete comment
commentController.delete('/hard-delete-comment/:commentId', authentication, CommentService.hardDeleteComment)
//  Freeze comment
commentController.patch('/freeze-comment/:commentId', authentication, CommentService.freezeComment)


export { commentController };