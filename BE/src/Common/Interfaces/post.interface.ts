import mongoose, { Document } from "mongoose";




export interface IPost extends Document<mongoose.Schema.Types.ObjectId> {
    description: string;
    attachments: string[];
    ownerId: mongoose.Schema.Types.ObjectId;
    allowComments: boolean;
    tags:string[];
    isFrozen: boolean;
}
