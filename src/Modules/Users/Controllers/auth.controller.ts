import { Router } from "express";
import AuthService from '../Services/auth.service'
import { authentication } from "../../../Middleware/authentication.middleware";
const authController = Router();


//SignUp
authController.post('/signUp', AuthService.signUp)
//Signin 
authController.post('/login' ,AuthService.signIn )
//confirm email
authController.post('/confirm-email', AuthService.confirmEmail);
//Forgot Password
//Reset Password
//Authentication with gmail
//Resend confirmation email



export {authController}

