import { IConversation } from "../../Common";
import { BaseRepository } from "./base.repository";
import { conversationModel } from "../Models";
import { Model } from "mongoose";

export class ConversationRepository extends BaseRepository<IConversation> {
    constructor() {
        super(conversationModel as unknown as Model<IConversation>);
    }
}