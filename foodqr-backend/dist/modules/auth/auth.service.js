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
const enums_1 = require("../../common/enums");
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const user = await this.userRepo.findOne({
            where: { email: dto.email },
            select: ['id', 'name', 'email', 'password', 'role', 'status', 'profileImage', 'balance'],
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.status !== enums_1.UserStatus.ACTIVE)
            throw new common_1.UnauthorizedException('Account is inactive');
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
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
    async sendOtp(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        if (user) {
            await this.userRepo.update(user.id, { otpCode: otp, otpExpiry: expiry });
        }
        return { message: 'OTP sent successfully', otp };
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
        return { message: 'OTP verified successfully' };
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
        return { message: 'Password reset link sent', token };
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
    async getProfile(userId) {
        return this.userRepo.findOne({ where: { id: userId }, relations: ['branch'] });
    }
    generateToken(user) {
        return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map