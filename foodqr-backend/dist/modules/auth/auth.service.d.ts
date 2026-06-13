import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private userRepo;
    private jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
    register(dto: RegisterDto): Promise<{
        token: string;
        user: any;
    }>;
    sendOtp(dto: OtpRequestDto): Promise<{
        message: string;
        otp: string;
    }>;
    verifyOtp(dto: OtpVerifyDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        token: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<User>;
    private generateToken;
}
