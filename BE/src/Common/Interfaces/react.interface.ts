import mongoose, { Document } from "mongoose";



export interface IReact extends Document<mongoose.Schema.Types.ObjectId>{
    targetId: mongoose.Schema.Types.ObjectId;
    targetType: string;
    ownerId: mongoose.Schema.Types.ObjectId;
    reactType: string;
}