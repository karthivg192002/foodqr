"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const user_entity_1 = require("../users/entities/user.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const tenant_user_index_entity_1 = require("../tenants/entities/tenant-user-index.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const enums_1 = require("../../common/enums");
const mail_service_1 = require("../mail/mail.service");
const sms_gateways_service_1 = require("../sms-gateways/sms-gateways.service");
let AuthService = class AuthService {
    constructor(userRepo, orderRepo, orderItemRepo, tenantRepo, tenantUserIndexRepo, tenantConnections, jwtService, mailService, smsService) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.tenantRepo = tenantRepo;
        this.tenantUserIndexRepo = tenantUserIndexRepo;
        this.tenantConnections = tenantConnections;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.smsService = smsService;
    }
    async login(dto) {
        const masterUser = await this.userRepo.findOne({
            where: { email: dto.email },
            select: ['id', 'name', 'email', 'password', 'role', 'status', 'profileImage', 'balance', 'tenantId'],
        });
        if (masterUser)
            return this.loginMasterUser(masterUser, dto.password);
        const indexEntry = await this.tenantUserIndexRepo.findOne({ where: { email: dto.email } });
        if (indexEntry)
            return this.loginTenantDbUser(indexEntry, dto.password);
        throw new common_1.UnauthorizedException('Invalid credentials');
    }
    async loginMasterUser(user, password) {
        if (user.status !== enums_1.UserStatus.ACTIVE)
            throw new common_1.UnauthorizedException('Account is inactive');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        let tenant = null;
        if (user.role !== enums_1.UserRole.SUPER_ADMIN && user.tenantId) {
            tenant = await this.assertTenantUsable(user.tenantId);
        }
        const token = this.generateToken(user, tenant);
        const { password: _p, ...userWithoutPassword } = user;
        return { token, user: { ...userWithoutPassword, tenantCode: tenant?.code } };
    }
    async loginTenantDbUser(indexEntry, password) {
        const tenant = await this.assertTenantUsable(indexEntry.tenantId);
        if (!tenant.dbName)
            throw new common_1.UnauthorizedException('Tenant account not found');
        const dataSource = await this.tenantConnections.getOrCreate(tenant.dbName);
        const tenantUserRepo = dataSource.getRepository(user_entity_1.User);
        const user = await tenantUserRepo.findOne({
            where: { id: indexEntry.userId },
            select: ['id', 'name', 'email', 'password', 'role', 'status', 'profileImage', 'balance', 'branchId'],
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.status !== enums_1.UserStatus.ACTIVE)
            throw new common_1.UnauthorizedException('Account is inactive');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.jwtService.sign({
            sub: user.id, email: user.email, role: user.role, tenantId: tenant.id, tenantCode: tenant.code,
        });
        const { password: _p, ...userWithoutPassword } = user;
        return { token, user: { ...userWithoutPassword, tenantId: tenant.id, tenantCode: tenant.code } };
    }
    async assertTenantUsable(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.UnauthorizedException('Tenant account not found');
        if (tenant.status === tenant_entity_1.TenantStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Your organization account is suspended. Contact support.');
        }
        if (tenant.status === tenant_entity_1.TenantStatus.CANCELLED) {
            throw new common_1.UnauthorizedException('Your organization account has been cancelled.');
        }
        return tenant;
    }
    async register(dto) {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('Email already registered');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
            role: dto.role || enums_1.UserRole.CUSTOMER,
        });
        await this.userRepo.save(user);
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }
    async guestSignup(dto) {
        const guest = this.userRepo.create({
            name: dto.name,
            phone: dto.phone,
            password: await bcrypt.hash((0, uuid_1.v4)(), 12),
            role: enums_1.UserRole.CUSTOMER,
            isGuest: true,
        });
        await this.userRepo.save(guest);
        const token = this.generateToken(guest);
        return { token, user: guest };
    }
    async sendOtp(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        if (user) {
            await this.userRepo.update(user.id, { otpCode: otp, otpExpiry: expiry });
        }
        else {
            const temp = this.userRepo.create({ email: dto.email, name: dto.email, password: 'temp', otpCode: otp, otpExpiry: expiry, status: enums_1.UserStatus.INACTIVE });
            await this.userRepo.save(temp);
        }
        this.mailService.sendOtp(dto.email, otp).catch(() => null);
        if (user?.phone) {
            this.smsService.send(user.phone, `Your FoodQR OTP is: ${otp}`).catch(() => null);
        }
        return { message: 'OTP sent' };
    }
    async verifyOtp(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.otpCode !== dto.otp)
            throw new common_1.BadRequestException('Invalid OTP');
        if (new Date() > user.otpExpiry)
            throw new common_1.BadRequestException('OTP expired');
        await this.userRepo.update(user.id, {
            otpCode: null,
            otpExpiry: null,
            emailVerifiedAt: new Date(),
        });
        return { message: 'OTP verified successfully', verified: true };
    }
    async sendPhoneOtp(phone) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        const existing = await this.userRepo.findOne({ where: { phone } });
        if (existing) {
            await this.userRepo.update(existing.id, { phoneOtpCode: otp, phoneOtpExpiry: expiry });
        }
        else {
            const temp = this.userRepo.create({
                name: phone, phone, password: 'temp',
                phoneOtpCode: otp, phoneOtpExpiry: expiry,
                status: enums_1.UserStatus.INACTIVE,
            });
            await this.userRepo.save(temp);
        }
        this.smsService.send(phone, `Your FoodQR OTP is: ${otp}`).catch(() => null);
        return { message: 'OTP sent to phone', phone };
    }
    async verifyPhoneOtp(phone, otp) {
        const user = await this.userRepo.findOne({ where: { phone } });
        if (!user)
            throw new common_1.NotFoundException('Phone number not found');
        if (user.phoneOtpCode !== otp)
            throw new common_1.BadRequestException('Invalid OTP');
        if (new Date() > user.phoneOtpExpiry)
            throw new common_1.BadRequestException('OTP expired');
        await this.userRepo.update(user.id, { phoneOtpCode: null, phoneOtpExpiry: null });
        return { message: 'Phone verified', verified: true, isNewUser: !user.name || user.name === phone };
    }
    async registerViaPhone(phone, name, password) {
        let user = await this.userRepo.findOne({ where: { phone } });
        if (!user)
            throw new common_1.BadRequestException('Phone not verified');
        const updates = { status: enums_1.UserStatus.ACTIVE };
        if (name)
            updates.name = name;
        if (password)
            updates.password = await bcrypt.hash(password, 12);
        else if (!user.password || user.password === 'temp') {
            updates.password = await bcrypt.hash((0, uuid_1.v4)(), 12);
        }
        updates.role = user.role || enums_1.UserRole.CUSTOMER;
        await this.userRepo.update(user.id, updates);
        user = await this.userRepo.findOne({ where: { id: user.id } });
        const token = this.generateToken(user);
        const { password: _p, ...rest } = user;
        return { token, user: rest };
    }
    async forgotPasswordPhone(phone) {
        const user = await this.userRepo.findOne({ where: { phone } });
        if (!user)
            throw new common_1.NotFoundException('Phone number not found');
        await this.sendPhoneOtp(phone);
        return { message: 'OTP sent to phone for password reset' };
    }
    async resetPasswordPhone(phone, otp, newPassword) {
        const user = await this.userRepo.findOne({ where: { phone } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.phoneOtpCode !== otp)
            throw new common_1.BadRequestException('Invalid OTP');
        if (new Date() > user.phoneOtpExpiry)
            throw new common_1.BadRequestException('OTP expired');
        const hashed = await bcrypt.hash(newPassword, 12);
        await this.userRepo.update(user.id, { password: hashed, phoneOtpCode: null, phoneOtpExpiry: null });
        return { message: 'Password reset successfully' };
    }
    async impersonate(adminId, targetUserId) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (!admin || admin.role !== enums_1.UserRole.ADMIN)
            throw new common_1.UnauthorizedException('Only admins can impersonate');
        const target = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!target)
            throw new common_1.NotFoundException('Target user not found');
        const token = this.jwtService.sign({ sub: target.id, role: target.role, impersonatedBy: adminId }, { expiresIn: '1h' });
        const { password, ...rest } = target;
        return { token, user: rest, impersonating: true, adminId };
    }
    async forgotPassword(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const token = (0, uuid_1.v4)();
        const expiry = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepo.update(user.id, {
            resetPasswordToken: token,
            resetPasswordExpiry: expiry,
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        this.mailService.sendPasswordReset(dto.email, token, frontendUrl).catch(() => null);
        return { message: 'Password reset link sent to your email' };
    }
    async resetPassword(dto) {
        const user = await this.userRepo.findOne({
            where: { resetPasswordToken: dto.token },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired token');
        if (new Date() > user.resetPasswordExpiry)
            throw new common_1.BadRequestException('Token expired');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        await this.userRepo.update(user.id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null,
        });
        return { message: 'Password reset successfully' };
    }
    async changePassword(userId, dto) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'password'],
        });
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Current password is incorrect');
        const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
        await this.userRepo.update(userId, { password: hashedPassword });
        return { message: 'Password changed successfully' };
    }
    async storeDeviceToken(userId, type, token) {
        const field = type === 'web' ? 'webToken' : 'deviceToken';
        await this.userRepo.update(userId, { [field]: token });
        return { message: 'Token stored' };
    }
    async deleteAccount(userId) {
        await this.userRepo.softDelete(userId);
        return { message: 'Account deactivated successfully' };
    }
    async getProfile(userId) {
        return this.userRepo.findOne({ where: { id: userId }, relations: ['branch'] });
    }
    async getCustomerDashboard(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['branch'] });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const [totalVisits, spentResult, topCategoryRows, peakDayRows, peakTimeRows] = await Promise.all([
            this.orderRepo.count({ where: { userId } }),
            this.orderRepo
                .createQueryBuilder('o')
                .where('o.userId = :userId AND o.paymentStatus = :ps', { userId, ps: enums_1.PaymentStatus.PAID })
                .select('SUM(o.total)', 'total')
                .addSelect('AVG(o.total)', 'avg')
                .getRawOne(),
            this.orderItemRepo
                .createQueryBuilder('oi')
                .innerJoin('oi.order', 'o', 'o.userId = :userId', { userId })
                .innerJoin('oi.item', 'item')
                .innerJoin('item.category', 'cat')
                .select('cat.name', 'category')
                .addSelect('SUM(oi.quantity)', 'qty')
                .groupBy('cat.name')
                .orderBy('SUM(oi.quantity)', 'DESC')
                .limit(3)
                .getRawMany(),
            this.orderRepo
                .createQueryBuilder('o')
                .where('o.userId = :userId', { userId })
                .select("TO_CHAR(o.createdAt, 'Day')", 'day')
                .addSelect('COUNT(*)', 'count')
                .groupBy("TO_CHAR(o.createdAt, 'Day')")
                .orderBy('COUNT(*)', 'DESC')
                .limit(1)
                .getRawMany(),
            this.orderRepo
                .createQueryBuilder('o')
                .where('o.userId = :userId', { userId })
                .select("EXTRACT(HOUR FROM o.createdAt)", 'hour')
                .addSelect('COUNT(*)', 'count')
                .groupBy("EXTRACT(HOUR FROM o.createdAt)")
                .orderBy('COUNT(*)', 'DESC')
                .limit(1)
                .getRawMany(),
        ]);
        const totalSpent = Number(spentResult?.total || 0);
        const avgOrderValue = Number(spentResult?.avg || 0);
        const peakHour = peakTimeRows[0]?.hour;
        const peakTime = peakHour != null ? `${String(peakHour).padStart(2, '0')}:00` : null;
        return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            walletBalance: Number(user.balance),
            isGuest: user.isGuest,
            totalVisits,
            totalSpent,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            topCategories: topCategoryRows.map((r) => r.category),
            peakDay: peakDayRows[0]?.day?.trim() || null,
            peakTime,
        };
    }
    async createPosCustomer(dto) {
        const tempPassword = await bcrypt.hash((0, uuid_1.v4)(), 12);
        const existing = dto.email ? await this.userRepo.findOne({ where: { email: dto.email } }) : null;
        if (existing)
            return existing;
        const user = this.userRepo.create({
            name: dto.name,
            phone: dto.phone,
            email: dto.email,
            password: tempPassword,
            role: enums_1.UserRole.CUSTOMER,
        });
        return this.userRepo.save(user);
    }
    generateToken(user, tenant) {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined,
            tenantCode: tenant?.code,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(4, (0, typeorm_1.InjectRepository)(tenant_user_index_entity_1.TenantUserIndex)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService,
        jwt_1.JwtService,
        mail_service_1.MailService,
        sms_gateways_service_1.SmsGatewaysService])
], AuthService);
//# sourceMappingURL=auth.service.js.map