import { Request, Response } from "express"
import { ReactRepository } from "../../../DB/Repositories"
import {  IRequest } from "../../../Common"
import { BadRequestException, SuccessResponse } from "../../../Utils"





class ReactService{

    private reactRepo = new ReactRepository()

    createReact = async (req:Request, res:Response)=>{
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const {targetId, targetType, reactType} = req.body
        if(!["Post", "Comment"].includes(targetType)) throw new BadRequestException('Invalid target type')

        const existingReact = await this.reactRepo.findOneDocument({targetId, ownerId: _id})
        if(existingReact) throw new BadRequestException('You have already reacted to this')

        const React = await this.reactRepo.createNewDocument({targetId, targetType, ownerId: _id, reactType})
        return res.status(201).json(SuccessResponse('Reacted successfully', 201, React))
    }

    removeReact = async (req:Request, res:Response)=>{
        const {user:{_id}} = (req as unknown as IRequest).loggedInUser
        const {targetId} = req.body

        const existingReact = await this.reactRepo.findOneDocument({targetId, ownerId: _id})
        if(!existingReact) throw new BadRequestException('You have not reacted to this');

        const unReacted = await this.reactRepo.deleteByIdDocument(existingReact._id)
        return res.status(200).json(SuccessResponse('React removed successfully', 200, unReacted))
    }
}

export default new ReactService()
