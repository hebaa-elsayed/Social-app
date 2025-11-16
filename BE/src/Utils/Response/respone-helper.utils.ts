import { ISuccessResponse, IFailureResponse } from "../../Common"


export function SuccessResponse<T>(
    message= 'Your request is proccessed successfully', 
    status = 200,  
    data?: T)
    : ISuccessResponse{
    return {
        meta:{
            status,
            success: true
        },
        data:{
            message,
            data
        }
    }
}



export function FailedResponse( 
    message= 'Your request is failed', 
    status = 500,  
    error?: object): IFailureResponse{
    return {
        meta:{
            status,
            success: false
        },
        error:{ 
            message,
            context: error
        }
    }
}


export const extractTags = (content:string): string[]=>{
    const regex = /@([a-zA-Z0-9._]+)/g
    const tags = []
    let match
    while((match = regex.exec(content)) !== null){
        tags.push(match[1])
    }
    return tags;
}