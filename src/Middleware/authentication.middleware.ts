import { NextFunction, Response } from "express"
import { JwtPayload } from "jsonwebtoken"

import { verifyToken } from "../Utils/Encryption/token.utils"
import { IRequest, IUser } from "../Common"
import { UserRepository } from "../DB/Repositories/user.repository"
import { UserModel } from "../DB/Models"

const userRepo = new UserRepository(UserModel)

export const authentication = async (req:IRequest, res:Response, next:NextFunction)=> {
    const {authorization : accessToken} = req.headers
    if(!accessToken) return res.status(401).json({message:'Please login first'})

    const [prefix, token] = accessToken.split(' ')
    if(prefix !== 'Bearer') return res.status(401).json({ message: 'Invalid token' })

    const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET as string)
    if(!decodedData._id) return res.status(401).json({ message: 'Invalid payload' })

    const user:IUser|null = await userRepo.findDocumentById( decodedData._id, '-password' )
    if(!user) return res.status(404).json({ message: 'please register first' })
    
    req.loggedInUser = {user, token:decodedData as JwtPayload}
    next()
}

    
