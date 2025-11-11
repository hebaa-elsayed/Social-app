import mongoose, { Document } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, OtpTypesEnum, FriendshipStatusEnum } from "..";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

interface IOTP {
    value:string;
    expiresAt:number;
    otpType:OtpTypesEnum;
}


interface IUser extends Document<mongoose.Schema.Types.ObjectId> {
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    role:RoleEnum;
    gender:GenderEnum;
    DOB?:Date;
    profilePicture?:string;
    coverPicture?:string;
    provider:ProviderEnum;
    googleId?:string;
    phoneNumber?:string;
    isVerified?:Boolean;
    OTPS: IOTP[];
    isConfirmed: Boolean;
}



interface IBlackListedToken extends Document{
    tokenId:string;
    expiresAt:Date;
}

interface IEmailArgument {
    to:string;
    cc?:string;
    subject:string;
    content:string;
    attachments?:[]
}

interface IRequest extends Request {
    loggedInUser:{ user: IUser , token :JwtPayload}
}

interface IFriendship extends Document<mongoose.Schema.Types.ObjectId> {
    requestFromId: mongoose.Schema.Types.ObjectId;
    requestToId: mongoose.Schema.Types.ObjectId;
    status:FriendshipStatusEnum;
}

interface IConversation {
    _id: mongoose.Schema.Types.ObjectId;
    type: 'direct' | 'group';
    name?: string;
    members: mongoose.Schema.Types.ObjectId[];
    [key: string]: any;
}

interface IMessage {
    _id: mongoose.Schema.Types.ObjectId;
    text: string;
    conversationId: mongoose.Schema.Types.ObjectId;
    senderId: mongoose.Schema.Types.ObjectId;
    attachments?: string[];
}


export {IUser , IEmailArgument , IRequest , IBlackListedToken , IFriendship , IConversation , IMessage}
