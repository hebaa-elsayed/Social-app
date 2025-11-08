import { Router } from "express";
import { authentication, Multer } from "../../../Middleware";
import profileService  from "../Services/profile.service";
const profileController = Router();

//  Get user profile

//  Update user profile

//  Delete user profile
profileController.delete('/delete-account', authentication, profileService.deleteAccount)
//  Upload user profile picture
profileController.post('/profile-picture', authentication, Multer().single('profilePicture'),profileService.uploadProfilePicture)

//  Upload user cover picture

//  List all users

//  Renew signed url
profileController.post('/renew-signed-url', authentication, profileService.renewSignedUrl)

//  Upload large user profile picture
// profileController.post('/large-profile-picture', authentication, Multer().single('profilePicture'),profileService.uploadLargeProfilePicture)

export { profileController };