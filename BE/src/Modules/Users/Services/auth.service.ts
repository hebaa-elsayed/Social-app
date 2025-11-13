import { NextFunction, Request, Response } from "express";
import { IRequest, IUser, OtpTypesEnum, SignUpBodyType } from "../../../Common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models";
import {encrypt , generateHash, compareHash, ConflictException, FailedResponse, SuccessResponse, BadRequestException} from "../../../Utils";
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
        const {firstName, lastName, email, password, DOB, gender, phoneNumber}: SignUpBodyType = req.body

        const isEmailExist = await this.userRepo.findOneDocument({email}, 'email')
        if(isEmailExist){
            throw next(new ConflictException('Email already exists', {invalidEmail:email}))
        }
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
            firstName, lastName, email, password, DOB, gender, phoneNumber, OTPS:[confirmationOtp]})
        return res.status(201).json(SuccessResponse<IUser>('User created successfully', 201, newUser))
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

    return res.status(200).json(SuccessResponse('Email confirmed successfully', 200));
    };

    // Sign in 
    signIn = async (req:Request, res:Response)=> {

        const {email, password} = req.body

        const user:IUser|null = await this.userRepo.findOneDocument({email})
        if(!user) {return res.status(401).json({message:'Email or password is incorrect'})}

        const isPasswordMatched = compareHash(password , user.password)
        if(!isPasswordMatched) {return res.status(401).json({message:'Email or password is incorrect' })}

        if (!user.isConfirmed) {return res.status(403).json({ message: 'Please confirm your email first' })}

        // ==================2-step verification ==================

        if(user.twoStepVerification){
            const otp = Math.floor(Math.random() * 1000000).toString();
            const otpHash = generateHash(otp);
            localEmitter.emit('sendEmail' , {
                to:user.email,
                subject:'Login OTP',
                content:`Your login OTP is ${otp}`
            })
            
            user.OTPS.push({
                value:otpHash, 
                expiresAt:Date.now() + 600000, 
                otpType:OtpTypesEnum.TWO_STEP_VERIFICATION})
            await user.save()
            
            return res.status(200).json(SuccessResponse('Login OTP sent successfully, please check your email', 200))
        }

        //=================generate tokens=======================
        const accessToken = generateToken(
        {
            _id : user._id,
            email: user.email,
            provider: user.provider,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            
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
        return res.status(200).json(SuccessResponse('User logged in successfully', 200, { tokens : {accessToken, refreshToken}}))
    }

    // Verify login OTP
    verifyLoginOtp = async (req:Request, res:Response)=> {
        const user = (req as unknown as IRequest).loggedInUser.user
        const {otp} = req.body

        if(!user.OTPS || !user.OTPS.length){return res.status(401).json({message:'No OTP found, please try again'})}

        const otpRecord = user.OTPS.find(o  => o.otpType === OtpTypesEnum.TWO_STEP_VERIFICATION && o.expiresAt > Date.now())
        if (!otpRecord) {return res.status(401).json({ message: 'Invalid or expired OTP.' })}
        const matchedOtp = compareSync(otp, otpRecord.value)
        if (!matchedOtp) {return res.status(401).json({ message: 'Invalid or expired OTP' })}

        user.OTPS = user.OTPS.filter(o => o !== otpRecord)
        await user.save()
    
    //=====================Generate Tokens=======================
    const accessToken = generateToken(
        {
            _id : user._id,
            email: user.email,
            provider: user.provider,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            
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
        return res.status(200).json(SuccessResponse('User logged in successfully', 200, { tokens : {accessToken, refreshToken}}))
    }

    // Enable two step verification
    enableTwoStepVerification = async (req:Request, res:Response)=> {
        const {user} = (req as unknown as IRequest).loggedInUser
        
        //send OTP
        const otp = Math.floor(Math.random() * 1000000).toString();
        const otpHash = generateHash(otp);
        localEmitter.emit('sendEmail' , {
            to:user.email,
            subject:'OTP for Two Step Verification',
            content:`Your OTP is ${otp}`
        })
        
        user.OTPS.push({
            value:otpHash, 
            expiresAt:Date.now() + 600000, 
            otpType:OtpTypesEnum.TWO_STEP_VERIFICATION})
        await user.save()

        return res.status(200).json(SuccessResponse('OTP sent successfully to your email', 200))
    }

    // Verify two step verification
    verifyTwoStepVerification = async (req:Request, res:Response)=> {
        const {user} = (req as unknown as IRequest).loggedInUser
        const {otp} = req.body

        const otpRecord = user.OTPS?.find(o => o.otpType === OtpTypesEnum.TWO_STEP_VERIFICATION && o.expiresAt > Date.now())
        if (!otpRecord) {return res.status(401).json({ message: 'Invalid or expired OTP.' })}
        const matchedOtp = compareSync(otp, otpRecord.value)
        if (!matchedOtp) {return res.status(401).json({ message: 'Invalid or expired OTP' })}

        user.twoStepVerification = true;
        user.OTPS = user.OTPS?.filter(o => o !== otpRecord);
        await user.save();

        return res.status(200).json(SuccessResponse('Two step verification enabled successfully', 200));
    }


    // Logout
    logout = async (req:Request, res:Response)=> {
        const {token: {jti , exp}} = (req as unknown as IRequest).loggedInUser
        const blackListedToken = await this.blackListedRepo.createNewDocument({tokenId:jti, expiresAt: new Date(exp || Date.now() + 600000)})
        return res.status(200).json(SuccessResponse('User logged out successfully', 200, {blackListedToken}))
    }

}

export default new AuthService()