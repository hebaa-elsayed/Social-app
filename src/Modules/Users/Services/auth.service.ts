import { NextFunction, Request, Response } from "express";
import { IRequest, IUser, OtpTypesEnum } from "../../../Common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models";
import {encrypt , generateHash, compareHash} from "../../../Utils";
import {localEmitter} from "../../../Utils/Services/email.utils"
import { generateToken } from "../../../Utils/Encryption/token.utils";
import { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { compareSync } from "bcrypt";
import { BlackListedTokenRepository } from "../../../DB/Repositories";
import { BlackListedTokenModel } from "../../../DB/Models";



class AuthService{

    private userRepo : UserRepository = new UserRepository(UserModel)
    private blackListedRepo : BlackListedTokenRepository = new BlackListedTokenRepository(BlackListedTokenModel)

    // SignUp
    signUp =async (req:Request, res:Response, next:NextFunction)=> {
        const {firstName, lastName, email, password, DOB, gender, phoneNumber}: Partial<IUser> = req.body

        const isEmailExist = await this.userRepo.findOneDocument({email}, 'email')
        if(isEmailExist){
            return res.status(409).json({message:'Email already exists', data:{invalidEmail:email }})
        }
        // Encrypt phone number
        const encryptedNumber = encrypt(phoneNumber as string)

        // hash password
        const hashedPassword = generateHash(password as string)
        
        //send OTP
        const otp = Math.floor(Math.random() * 1000000).toString()
        localEmitter.emit('sendEmail' , {
            to:email,
            subject:'OTP for SignUp',
            content:`Your OTP is ${otp}`
        })
        const confirmationOtp = {
            value:generateHash(otp),
            expiresAt:Date.now() + 600000,
            otpType:OtpTypesEnum.CONFIRMATION 
        }

        const newUser = await this.userRepo.createNewDocument({
            firstName, lastName, email, password:hashedPassword, DOB, gender, phoneNumber:encryptedNumber, OTPS:[confirmationOtp]})
        return res.status(201).json({message:'User created successfully', data:{newUser}})
    }


    // Confirm email
    confirmEmail = async (req: Request, res: Response) => {
    const { email, otp }: { email: string; otp: string } = req.body;

    if (!email || !otp) {return res.status(400).json({ message: 'Email and OTP are required' })};

    const user = await this.userRepo.findOneDocument({ email });

    if (!user) {return res.status(404).json({ message: 'User not found' })};
    
    const matchedOtp = compareSync(otp, user.OTPS?.[0].value || '');
    if (!matchedOtp) {return res.status(401).json({ message: 'Invalid or expired OTP' })}

    if (user.isConfirmed) {return res.status(200).json({ message: 'Email already confirmed' })};

    user.isConfirmed = true;
    user.OTPS = [];
    await user.save();

    return res.status(200).json({ message: 'Email confirmed successfully' });
    };

    // Sign in 
    signIn = async (req:Request, res:Response)=> {

        const {email, password} = req.body

        const user:IUser|null = await this.userRepo.findOneDocument({email})
        if(!user) {return res.status(401).json({message:'Email or password is incorrect'})}

        const isPasswordMatched = compareHash(password , user.password)
        if(!isPasswordMatched) {return res.status(401).json({message:'Email or password is incorrect' })}

        if (!user.isConfirmed) {return res.status(403).json({ message: 'Please confirm your email first' })}

        const accessToken = generateToken(
        {
            _id : user._id,
            email: user.email,
            provider: user.provider,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET as string,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
            jwtid: uuidv4()
        }
        )
        const refreshToken = generateToken(
            {
            _id : user._id,
            email: user.email,
            provider: user.provider,
            role: user.role
        },
        process.env.JWT_REFRESH_SECRET as string,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
            jwtid: uuidv4()
        }
        )
        return res.status(200).json({message:'User logged in successfully', data:{user, accessToken, refreshToken}})
    }

    // Logout
    logout = async (req:Request, res:Response)=> {
        const {token: {jti , exp}} = (req as unknown as IRequest).loggedInUser
        const blackListedToken = await this.blackListedRepo.createNewDocument({tokenId:jti, expiresAt: new Date(exp || Date.now() + 600000)})
        return res.status(200).json({message:'User logged out successfully', data: {blackListedToken}})
    }

}

export default new AuthService()