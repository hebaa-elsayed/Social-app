import { Model } from "mongoose";
import { IUser } from "../../Common";
import { BaseRepository } from "./base.repository";



export class UserRepository extends BaseRepository<IUser>{
    static findDocumentById(_id: any, arg1: string) {
        throw new Error("Method not implemented.");
    }
    constructor (protected _usermodel: Model<IUser>){
        super(_usermodel)
    
    
    // findUserByEmail


    // deleteUserAlongWithPictures
    
    }
}
    