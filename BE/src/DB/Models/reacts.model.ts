import mongoose from "mongoose"
import { IReact } from "../../Common";


const reactSchema = new mongoose.Schema({
    targetId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Post', 'Comment'],
        default: 'Post'
    },
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reactType: {
        type: String,
        required: true,
        enum: ['like', "dislike"],
        default: 'like'
    }
})

export const ReactModel = mongoose.model<IReact>('React', reactSchema)
