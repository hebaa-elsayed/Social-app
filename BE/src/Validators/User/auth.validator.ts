import z from 'zod'
import { GenderEnum } from '../../Common'
import { isValidObjectId } from 'mongoose'


export const SignUpValidator = {
    body: z.strictObject({
        firstName: z.string().min(3, 'First name must be at least 3 characters long').max(20, 'First name must be at most 20 characters long'),
        lastName: z.string().min(3, 'Last name must be at least 3 characters long').max(20, 'Last name must be at most 20 characters long'),
        email: z.email(),
        password: z.string(),
        passwordConfirmation: z.string(),
        gender: z.enum(GenderEnum),
        DOB: z.date().optional(),
        phoneNumber: z.string().min(11, 'Phone number must be at least 11 characters long').max(11, 'Phone number must be at most 11 characters long'),
        skills: z.array(
            z.object({
                skill: z.string(),
                level: z.enum(['beginner', 'intermediate', 'advanced'])
            })
        ).optional()
    })
    .safeExtend({
        userId: z.string().optional()
    })
    .superRefine((val, cxt)=>{
        if(val.password !== val.passwordConfirmation){
            cxt.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passwords do not match',
                path: ['passwordConfirmation']
            })
        }
        if(val.userId && !isValidObjectId(val)){
            cxt.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid user ID',
                path: ['userId']
            })
        }

    })
}


export const updateEmailValidator = {
    body: z.object({
        newEmail: z.email()
    })
}


export const verifyEmailValidator = {
    body: z.object({
        otp: z.string().length(6)
    })
}