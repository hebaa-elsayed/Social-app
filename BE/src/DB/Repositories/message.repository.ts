import { BaseRepository } from "./base.repository";
import { IMessage } from "../../Common";
import { MessagesModel } from "../Models";
import { Model } from "mongoose";


export class MessageRepository extends BaseRepository<IMessage> {
    constructor() {
        super(MessagesModel as unknown as Model<IMessage>)
    }
}