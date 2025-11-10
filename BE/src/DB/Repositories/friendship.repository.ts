import { FriendshipModel } from "../Models";
import { IFriendship } from "../../Common";
import { BaseRepository } from "./base.repository";



export class FriendshipRepository extends BaseRepository<IFriendship>{
    constructor(){
        super(FriendshipModel)
    }
}   