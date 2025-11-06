import { NextFunction, Request, Response } from "express"
import { JwtPayload } from "jsonwebtoken"

import { verifyToken, HttpException, BadRequestException } from "../Utils"
import { IRequest, IUser } from "../Common"
import { UserRepository , BlackListedTokenRepository} from "../DB/Repositories"
import { UserModel , BlackListedTokenModel } from "../DB/Models"

const userRepo = new UserRepository(UserModel)
const blackListedRepo = new BlackListedTokenRepository(BlackListedTokenModel)

export const authentication = async (req:Request,res:Response, next:NextFunction)=> {
    const {authorization : accessToken} = req.headers
    if(!accessToken) throw next(new BadRequestException('Please login first'))

    const [prefix, token] = accessToken.split(' ')
    if(prefix !== process.env.JWT_PREFIX) throw next(new Error('Invalid token'))

    const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET as string)
    if(!decodedData._id) throw next(new Error('Invalid payload'))
    
    const blackListedToken = await blackListedRepo.findOneDocument({tokenId:decodedData.jti})
    if(blackListedToken) throw next(new Error(' Your session is expired please login '))

    const user:IUser|null = await userRepo.findDocumentById( decodedData._id, '-password' )
    if(!user) throw next(new Error('Please register first'));
    
    (req as unknown as IRequest).loggedInUser = {user, token:decodedData as JwtPayload}
    next()
}

    
