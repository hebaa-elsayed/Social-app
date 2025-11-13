import { BaseRepository } from "./base.repository";
import { IComment } from "../../Common";
import { CommentModel } from "../Models";



export class CommentRepository extends BaseRepository<IComment> {
    constructor() {
        super(CommentModel)
    }
}
