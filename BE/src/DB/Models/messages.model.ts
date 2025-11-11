import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    text: String,
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    attachments: [String],
})

export const MessagesModel = mongoose.model('Message', messageSchema)