import { UserRole } from '../../../common/enums';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    countryCode?: string;
    role?: UserRole;
}
export declare class OtpRequestDto {
    email: string;
}
export declare class OtpVerifyDto {
    email: string;
    otp: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
