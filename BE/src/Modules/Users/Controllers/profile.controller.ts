import { Router } from "express";
import { authentication, Multer } from "../../../Middleware";
import profileService  from "../Services/profile.service";
const profileController = Router();

//  Get user profile
profileController.get('/get-profile', authentication, profileService.getProfile)

//  Update user profile
profileController.put('/update-profile', authentication, profileService.updateProfile)

//  Update user password
profileController.put('/update-password', authentication, profileService.updatePassword)

//  Delete user profile
profileController.delete('/delete-account', authentication, profileService.deleteAccount)

//  Upload user profile picture
profileController.post('/profile-picture', authentication, Multer().single('profilePicture'),profileService.uploadProfilePicture)

//  Upload user cover picture
profileController.post('/cover-picture', authentication, Multer().single('coverPicture'),profileService.uploadCoverPicture)

//  List all users
profileController.get('/list-users', authentication, profileService.listUsers)

//  Renew signed url
profileController.post('/renew-signed-url', authentication, profileService.renewSignedUrl)

//  Upload large user profile picture
// profileController.post('/large-profile-picture', authentication, Multer().single('profilePicture'),profileService.uploadLargeProfilePicture)

//  Send friendship request
profileController.post('/send-friendship-request', authentication, profileService.sendFriendshipRequest)

// List friendship requests
profileController.get('/list-friend-requests', authentication, profileService.listRequests)

// Respond to friendship request
profileController.patch('/respond-to-friendship-request', authentication, profileService.respondToFriendshipRequest)
// Create group
profileController.post('/create-group', authentication, profileService.createGroup)

export { profileController };