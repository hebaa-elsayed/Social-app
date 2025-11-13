import { Router } from "express";
import { authentication } from "../../Middleware";
import ReactService from "./Services/reacts.service";
const reactController = Router();

//  react on a post or comment
reactController.post('/react', authentication, ReactService.createReact)
//  remove react on a post or comment
reactController.delete('/react', authentication, ReactService.removeReact)



export { reactController };