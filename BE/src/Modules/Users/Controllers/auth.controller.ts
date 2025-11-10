import { Router } from "express";
import AuthService from '../Services/auth.service'
import { authentication, validationMiddleware } from "../../../Middleware";
import { SignUpValidator } from "../../../Validators";
const authController = Router();


//SignUp
authController.post('/signUp', validationMiddleware(SignUpValidator), AuthService.signUp)
//Signin 
authController.post('/login' ,AuthService.signIn )
//confirm email
authController.post('/confirm-email', AuthService.confirmEmail);
//Forgot Password

//Reset Password

//Authentication with gmail

//Resend confirmation email

//Resend Email

// Logout
authController.post('/logout', authentication, AuthService.logout)


export {authController}

