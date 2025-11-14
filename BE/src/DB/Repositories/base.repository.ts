import mongoose, { FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";



export abstract class BaseRepository<T>{
    constructor(private model:Model<T>){}
    
    async createNewDocument(document:Partial<T>):Promise<T>{
        return await this.model.create(document)
    }

    async findOneDocument(filters:FilterQuery<T>, projection?:ProjectionType<T>, options?:QueryOptions<T>):Promise<T | null>{
        return await this.model.findOne(filters, projection, options)
    }

    async findDocumentById(id:string | mongoose.Schema.Types.ObjectId , projection?:ProjectionType<T>, options?:QueryOptions<T>):Promise<T | null>{
        return await this.model.findById(id, projection, options)
    }

    async deleteByIdDocument(id:string | mongoose.Schema.Types.ObjectId){
        return await this.model.findByIdAndDelete(id)
    }
    
    async updateOneDocument(filters:FilterQuery<T>, updatedObject :UpdateQuery<T>, options?:QueryOptions<T>){
        return await this.model.findOneAndUpdate(filters, updatedObject, options)
    }

     async findDocuments(filters: FilterQuery<T> = {}, projection?:ProjectionType<T>, options?:QueryOptions<T>):Promise< T[] | []>{
        return await this.model.find(filters, projection, options)
    }

    async freezeDocumentById(id:string | mongoose.Schema.Types.ObjectId){
        return await this.model.findByIdAndUpdate(id, {isFrozen: true}, {new: true})
    }

    async deleteOneDocument(filters:FilterQuery<T>){
        return await this.model.deleteOne(filters)
    }

    async deleteDocuments(filters:FilterQuery<T>):Promise<{deletedCount?:number}>{
        return await this.model.deleteMany(filters)
    }


}