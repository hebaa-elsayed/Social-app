import mongoose, { Document } from "mongoose";




export interface IComment extends Document<mongoose.Schema.Types.ObjectId> {
    content: string;
    attachment: string;
    ownerId: mongoose.Schema.Types.ObjectId;
    refId: mongoose.Schema.Types.ObjectId;
    onModel: string;
    isFrozen: boolean;
}