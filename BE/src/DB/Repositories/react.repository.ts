import { ReactModel } from "../Models";
import { BaseRepository } from "./base.repository";
import { IReact } from "../../Common";



export class ReactRepository extends BaseRepository<IReact> {
    constructor() {
        super(ReactModel)
    }
}  
