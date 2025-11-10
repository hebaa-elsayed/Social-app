import { NextFunction, Request, Response } from "express";
import {  ZodType } from "zod";
import { BadRequestException } from "../Utils";


type RequestKeyType = keyof Request
type SchemaType = Partial<Record<RequestKeyType, ZodType>>
type ValidationErrorType = {
    key: RequestKeyType;
    issues: {
        message: string;
        path: PropertyKey[];
    }[];
}

export const validationMiddleware = (schema: SchemaType) =>{
    return (req:Request, res:Response, next:NextFunction) => {
        const reqKeys: RequestKeyType[] = ['body', 'query', 'params', 'headers']
       
        const validationErrors: ValidationErrorType[] = [];
        for (const key of reqKeys) {
            if (schema[key]) {
                const result = schema[key].safeParse(req[key]);
                console.log(`The validation result is`, {key, result});
                if(!result?.success){
                    const issues = result.error?.issues?.map(issue =>({
                        message: issue.message,
                        path: issue.path
                    }))
                validationErrors.push({key, issues});
                }
            }
        }

        if(validationErrors.length) throw new BadRequestException('Validation Error', {validationErrors})

        next();
    }
}