import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, IUser, OtpTypesEnum} from "../../Common";
import { decrypt, encrypt, generateHash, S3ClientService } from "../../Utils";


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
    },
    twoStepVerification:{
        type: Boolean,
        default: false
    },

})

// Document middleware
userSchema.pre('save', function(){
    console.log(this.isModified('password'));
    console.log(this.modifiedPaths());
    console.log(this.getChanges());
    

    if(this.isModified('password')){
        this.password = generateHash(this.password as string) 
    }


    if(this.isModified('email')){
        this.email = this.email.toLowerCase()
    }

    if(this.isModified('phoneNumber')){
        this.phoneNumber = encrypt(this.phoneNumber as string)
    }
        
})


// Query middleware
userSchema.post(/^find/, function(doc){
    if((this as unknown as {op:string}).op == 'find'){
        doc.forEach((user:IUser)=>{
            if(user.phoneNumber){
                user.phoneNumber = decrypt(user.phoneNumber as string)
            }
        })
    } else {
        doc.phoneNumber = decrypt(doc.phoneNumber as string)
    }
})


const S3Service = new S3ClientService()
userSchema.post('findOneAndDelete', async function(doc){
    if(doc.profilePicture){
        await S3Service.deleteFileFromS3(doc.profilePicture)
    }
    if(doc.coverPicture){
        await S3Service.deleteFileFromS3(doc.coverPicture)
    }
}) 


const UserModel = mongoose.model<IUser>('User' , userSchema)
export {UserModel}