import { UserRepository } from "../DB/Repositories";
import { UserModel } from "../DB/Models";
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../Utils";
import { IRequest } from "../Common";

const userRepo = new UserRepository(UserModel)

export const blockCheckMiddleware = async (req:Request, res:Response, next:NextFunction)=>{
    const {user:{_id}} = (req as IRequest).loggedInUser
    const targetUserId = req.body.targetUserId || req.params.targetUserId || req.query.userId || req.body.requestToId || req.body.requestFromId 

    if(!targetUserId) return next();

    const currentUser = await userRepo.findDocumentById(_id)
    const targetUser = await userRepo.findDocumentById(targetUserId)
    if (!targetUser || !currentUser) return next();

    if(currentUser.blockedUsers.includes(targetUser._id)) throw new BadRequestException('You have blocked this user');
    if(targetUser.blockedUsers.includes(currentUser._id)) {throw new BadRequestException('This user has blocked you');}
    next()
}
