import { Router } from "express";
import { authentication , blockCheckMiddleware } from "../../Middleware";
import ReactService from "./Services/reacts.service";
const reactController = Router();

//  react on a post or comment
reactController.post('/react', authentication, blockCheckMiddleware, ReactService.createReact)
//  remove react on a post or comment
reactController.delete('/react', authentication, blockCheckMiddleware, ReactService.removeReact)



export { reactController };