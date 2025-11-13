import mongoose from "mongoose";





export interface IConversation {
    _id: mongoose.Schema.Types.ObjectId;
    type: 'direct' | 'group';
    name?: string;
    members: mongoose.Schema.Types.ObjectId[];
    [key: string]: any;
}

export interface IMessage {
    _id: mongoose.Schema.Types.ObjectId;
    text: string;
    conversationId: mongoose.Schema.Types.ObjectId;
    senderId: mongoose.Schema.Types.ObjectId;
    attachments?: string[];
}