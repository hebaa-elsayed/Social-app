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
// enable two step verification
authController.post('/enable-two-step-verification', authentication, AuthService.enableTwoStepVerification)
// verify two step verification
authController.post('/verify-two-step-verification', authentication, AuthService.verifyTwoStepVerification)
// verify login OTP
authController.post('/verify-login-otp', authentication, AuthService.verifyLoginOtp)
// Logout
authController.post('/logout', authentication, AuthService.logout)


export {authController}

