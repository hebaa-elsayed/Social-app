import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, IUser, OtpTypesEnum} from "../../Common";


const userSchema = new mongoose.Schema<IUser>({
    firstName:{
        type: String,
        required: true,
        minLength: [3 ,  'First name must be at least 4 characters long'],
        maxLength: [10 , 'First name must be at most 20 characters long']
    },
    lastName:{
        type: String,
        required: true,
        minLength: [3 ,  'Last name must be at least 4 characters long'],
        maxLength: [10 , 'Last name must be at most 20 characters long']
    },
    email:{
        type: String,
        required: true,
        index:{
            unique: true,
            name: 'idx_email'
            }
    },
     isVerified:{
        type: Boolean,
        default: false
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:RoleEnum,
        default:RoleEnum.USER
    },
    gender:{
        type:String,
        enum:GenderEnum,
        default:GenderEnum.OTHER
    },
    DOB:Date,
    profilePicture: String,
    coverPicture: String,
    provider:{
        type: String,
        enum:ProviderEnum,
        default:ProviderEnum.LOCAL
    },
    googleId:String,
    phoneNumber: String,
    OTPS:[{
        value:{type:String, required:true},
        expiresAt:{type:Date, default:()=> new Date (Date.now() + 10 * 60 * 1000 )},  // default 10 mins
        otpType:{type:String, enum:OtpTypesEnum, required:true}
    }],
    isConfirmed: {
        type: Boolean,
        default: false
    }
})

const UserModel = mongoose.model<IUser>('User' , userSchema)
export {UserModel}