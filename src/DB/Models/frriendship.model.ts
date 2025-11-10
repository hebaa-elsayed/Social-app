import mongoose from "mongoose";
import { FriendshipStatusEnum } from "../../Common"
import { IFriendship } from "../../Common";



const friendshipSchema = new mongoose.Schema<IFriendship>({
   
    requestFromId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    requestToId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:FriendshipStatusEnum,
        default:FriendshipStatusEnum.PENDING
    }
})


export const FriendshipModel = mongoose.model<IFriendship>('Friendship', friendshipSchema)