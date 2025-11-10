import mongoose from "mongoose";
import { IBlackListedToken } from "../../Common";

const BlackListedTokensSchema = new mongoose.Schema<IBlackListedToken>({
    tokenId:{type:String , required:true},
    expiresAt:{type:Date , required:true}
})

const BlackListedTokenModel = mongoose.model<IBlackListedToken>('BlackListedTokens' , BlackListedTokensSchema)
export {BlackListedTokenModel}