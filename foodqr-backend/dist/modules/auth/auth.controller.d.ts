import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
    register(dto: RegisterDto): Promise<{
        token: string;
        user: any;
    }>;
    guestSignup(dto: {
        name: string;
        phone?: string;
    }): Promise<{
        token: string;
        user: User;
    }>;
    sendOtp(dto: OtpRequestDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: OtpVerifyDto): Promise<{
        message: string;
        verified: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: User): Promise<User>;
    getCustomerDashboard(user: User): Promise<{
        name: string;
        email: string;
        phone: string;
        profileImage: string;
        walletBalance: number;
        isGuest: boolean;
        totalVisits: number;
        totalSpent: number;
        avgOrderValue: number;
        topCategories: any[];
        peakDay: any;
        peakTime: string;
    }>;
    changePassword(user: User, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(user: User): Promise<{
        message: string;
    }>;
    createPosCustomer(dto: {
        name: string;
        phone?: string;
        email?: string;
    }): Promise<User>;
    storeDeviceToken(user: User, dto: {
        type: 'web' | 'mobile';
        token: string;
    }): Promise<{
        message: string;
    }>;
    sendGuestOtp(body: {
        phone: string;
    }): Promise<{
        message: string;
        phone: string;
    }>;
    verifyGuestOtp(body: {
        phone: string;
        otp: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    sendPhoneOtp(body: {
        phone: string;
    }): Promise<{
        message: string;
        phone: string;
    }>;
    verifyPhoneOtp(body: {
        phone: string;
        otp: string;
    }): Promise<{
        message: string;
        verified: boolean;
        isNewUser: boolean;
    }>;
    registerViaPhone(body: {
        phone: string;
        name?: string;
        password?: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    forgotPasswordPhone(body: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    resetPasswordPhone(body: {
        phone: string;
        otp: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    impersonate(admin: User, userId: string): Promise<{
        token: string;
        user: any;
        impersonating: boolean;
        adminId: string;
    }>;
}
