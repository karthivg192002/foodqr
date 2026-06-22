import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantUserIndex } from '../tenants/entities/tenant-user-index.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import { SmsGatewaysService } from '../sms-gateways/sms-gateways.service';
export declare class AuthService {
    private userRepo;
    private orderRepo;
    private orderItemRepo;
    private tenantRepo;
    private tenantUserIndexRepo;
    private tenantConnections;
    private jwtService;
    private mailService;
    private smsService;
    constructor(userRepo: Repository<User>, orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, tenantRepo: Repository<Tenant>, tenantUserIndexRepo: Repository<TenantUserIndex>, tenantConnections: TenantConnectionService, jwtService: JwtService, mailService: MailService, smsService: SmsGatewaysService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
    private loginMasterUser;
    private loginTenantDbUser;
    private assertTenantUsable;
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
    sendPhoneOtp(phone: string): Promise<{
        message: string;
        phone: string;
    }>;
    verifyPhoneOtp(phone: string, otp: string): Promise<{
        message: string;
        verified: boolean;
        isNewUser: boolean;
    }>;
    registerViaPhone(phone: string, name?: string, password?: string): Promise<{
        token: string;
        user: any;
    }>;
    forgotPasswordPhone(phone: string): Promise<{
        message: string;
    }>;
    resetPasswordPhone(phone: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    impersonate(adminId: string, targetUserId: string): Promise<{
        token: string;
        user: any;
        impersonating: boolean;
        adminId: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    storeDeviceToken(userId: string, type: 'web' | 'mobile', token: string): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<User>;
    getCustomerDashboard(userId: string): Promise<{
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
    createPosCustomer(dto: {
        name: string;
        phone?: string;
        email?: string;
    }): Promise<User>;
    private generateToken;
}
