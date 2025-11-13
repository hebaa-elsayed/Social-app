enum RoleEnum {
    USER = 'user',
    ADMIN = 'admin'
}

enum GenderEnum {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

enum ProviderEnum {
    GOOGLE = 'google', 
    LOCAL = 'local'
}

enum OtpTypesEnum{
    CONFIRMATION = 'confirmation',
    RESET_PASSWORD = 'reset-password',
    TWO_STEP_VERIFICATION = 'two-step-verification',
}

enum FriendshipStatusEnum{
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}
export {RoleEnum, GenderEnum , ProviderEnum, OtpTypesEnum, FriendshipStatusEnum}