import { NextFunction, Request, Response } from "express"
import { JwtPayload } from "jsonwebtoken"

import { verifyToken } from "../Utils/Encryption/token.utils"
import { IRequest, IUser } from "../Common"
import { UserRepository , BlackListedTokenRepository} from "../DB/Repositories"
import { UserModel , BlackListedTokenModel } from "../DB/Models"

const userRepo = new UserRepository(UserModel)
const blackListedRepo = new BlackListedTokenRepository(BlackListedTokenModel)

export const authentication = async (req:Request, res:Response, next:NextFunction)=> {
    const {authorization : accessToken} = req.headers
    if(!accessToken) return res.status(401).json({message:'Please login first'})

    const [prefix, token] = accessToken.split(' ')
    if(prefix !== process.env.JWT_PREFIX) return res.status(401).json({ message: 'Invalid token' })

    const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET as string)
    if(!decodedData._id) return res.status(401).json({ message: 'Invalid payload' })
    
    const blackListedToken = await blackListedRepo.findOneDocument({tokenId:decodedData.jti})
    if(blackListedToken) return res.status(401).json({ message: ' Your session is expired please login ' })

    const user:IUser|null = await userRepo.findDocumentById( decodedData._id, '-password' )
    if(!user) return res.status(404).json({ message : 'Please register first' });
    
    (req as unknown as IRequest).loggedInUser = {user, token:decodedData as JwtPayload}
    next()
}

    
