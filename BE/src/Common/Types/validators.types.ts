import z from 'zod'
import { SignUpValidator, updateEmailValidator, verifyEmailValidator } from '../../Validators'


export type SignUpBodyType = z.infer<typeof SignUpValidator.body>
    
export type UpdateEmailBodyType = z.infer<typeof updateEmailValidator.body>
export type VerifyEmailBodyType = z.infer<typeof verifyEmailValidator.body>