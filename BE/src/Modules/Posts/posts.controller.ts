import { Router } from "express";
import { authentication, Multer } from "../../Middleware";
import postsService from "./Services/posts.service";
const postController = Router();

//  Add post
postController.post('/add', authentication, Multer().array('files', 3), postsService.addPost)
//  Update post
//  Delete post
//  Get home posts
postController.get('/home', authentication, postsService.listHomePosts)
//  Get post by id
//  Get all posts for specific user



export { postController };