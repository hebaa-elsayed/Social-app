import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
}, {timestamps:true}
)


export const conversationModel = mongoose.model('Conversation', conversationSchema)