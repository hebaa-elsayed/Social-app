import { Router } from "express";
import { authentication, Multer } from "../../Middleware";
import postsService from "./Services/posts.service";
const postController = Router();

//  Add post
postController.post('/add', authentication, Multer().array('files', 3), postsService.addPost)
//  Get home posts
postController.get('/home', authentication, postsService.listHomePosts)
//  Delete post
postController.delete('/delete/:postId', authentication, postsService.hardDeletePost)
//  Freeze post
postController.put('/freeze/:postId', authentication, postsService.freezePost)


export { postController };