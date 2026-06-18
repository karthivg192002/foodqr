import {
  Injectable, BadRequestException, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { UserRole, UserStatus, PaymentStatus } from '../../common/enums';
import {
  LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto,
  ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto,
} from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import { SmsGatewaysService } from '../sms-gateways/sms-gateways.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    private jwtService: JwtService,
    private mailService: MailService,
    private smsService: SmsGatewaysService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password', 'role', 'status', 'profileImage', 'balance'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Account is inactive');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user as any;
    return { token, user: userWithoutPassword };
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || UserRole.CUSTOMER,
    });
    await this.userRepo.save(user);

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user as any;
    return { token, user: userWithoutPassword };
  }

  async guestSignup(dto: { name: string; phone?: string }) {
    const guest = this.userRepo.create({
      name: dto.name,
      phone: dto.phone,
      password: await bcrypt.hash(uuidv4(), 12),
      role: UserRole.CUSTOMER,
      isGuest: true,
    });
    await this.userRepo.save(guest);
    const token = this.generateToken(guest);
    return { token, user: guest };
  }

  async sendOtp(dto: OtpRequestDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      await this.userRepo.update(user.id, { otpCode: otp, otpExpiry: expiry });
    } else {
      // Store OTP temporarily — will be verified at register step
      const temp = this.userRepo.create({ email: dto.email, name: dto.email, password: 'temp', otpCode: otp, otpExpiry: expiry, status: UserStatus.INACTIVE });
      await this.userRepo.save(temp);
    }

    // Send OTP via email and SMS (both non-blocking)
    this.mailService.sendOtp(dto.email, otp).catch(() => null);
    if (user?.phone) {
      this.smsService.send(user.phone, `Your FoodQR OTP is: ${otp}`).catch(() => null);
    }

    return { message: 'OTP sent' };
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.otpCode !== dto.otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiry) throw new BadRequestException('OTP expired');

    await this.userRepo.update(user.id, {
      otpCode: null,
      otpExpiry: null,
      emailVerifiedAt: new Date(),
    });
    return { message: 'OTP verified successfully', verified: true };
  }

  /** Step 1: Send OTP to phone number */
  async sendPhoneOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) {
      await this.userRepo.update(existing.id, { phoneOtpCode: otp, phoneOtpExpiry: expiry });
    } else {
      const temp = this.userRepo.create({
        name: phone, phone, password: 'temp',
        phoneOtpCode: otp, phoneOtpExpiry: expiry,
        status: UserStatus.INACTIVE,
      });
      await this.userRepo.save(temp);
    }

    this.smsService.send(phone, `Your FoodQR OTP is: ${otp}`).catch(() => null);
    return { message: 'OTP sent to phone', phone };
  }

  /** Step 2: Verify phone OTP */
  async verifyPhoneOtp(phone: string, otp: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('Phone number not found');
    if (user.phoneOtpCode !== otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.phoneOtpExpiry) throw new BadRequestException('OTP expired');

    await this.userRepo.update(user.id, { phoneOtpCode: null, phoneOtpExpiry: null });
    return { message: 'Phone verified', verified: true, isNewUser: !user.name || user.name === phone };
  }

  /** Step 3: Complete phone registration (for new users) or login (for existing) */
  async registerViaPhone(phone: string, name?: string, password?: string) {
    let user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new BadRequestException('Phone not verified');

    const updates: Partial<User> = { status: UserStatus.ACTIVE };
    if (name) updates.name = name;
    if (password) updates.password = await bcrypt.hash(password, 12);
    else if (!user.password || user.password === 'temp') {
      updates.password = await bcrypt.hash(uuidv4(), 12);
    }
    updates.role = user.role || UserRole.CUSTOMER;
    await this.userRepo.update(user.id, updates);
    user = await this.userRepo.findOne({ where: { id: user.id } });

    const token = this.generateToken(user);
    const { password: _p, ...rest } = user as any;
    return { token, user: rest };
  }

  /** Forgot password via phone OTP */
  async forgotPasswordPhone(phone: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('Phone number not found');
    await this.sendPhoneOtp(phone);
    return { message: 'OTP sent to phone for password reset' };
  }

  /** Reset password after phone OTP verification */
  async resetPasswordPhone(phone: string, otp: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('User not found');
    if (user.phoneOtpCode !== otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.phoneOtpExpiry) throw new BadRequestException('OTP expired');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(user.id, { password: hashed, phoneOtpCode: null, phoneOtpExpiry: null });
    return { message: 'Password reset successfully' };
  }

  /** Admin impersonation — generate a short-lived token for target user */
  async impersonate(adminId: string, targetUserId: string) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin || admin.role !== UserRole.ADMIN) throw new UnauthorizedException('Only admins can impersonate');

    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) throw new NotFoundException('Target user not found');

    const token = this.jwtService.sign(
      { sub: target.id, role: target.role, impersonatedBy: adminId },
      { expiresIn: '1h' },
    );
    const { password, ...rest } = target as any;
    return { token, user: rest, impersonating: true, adminId };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');

    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await this.userRepo.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpiry: expiry,
    });

    // Send reset link via email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    this.mailService.sendPasswordReset(dto.email, token, frontendUrl).catch(() => null);

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: dto.token },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');
    if (new Date() > user.resetPasswordExpiry) throw new BadRequestException('Token expired');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    await this.userRepo.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    });
    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(userId, { password: hashedPassword });
    return { message: 'Password changed successfully' };
  }

  async storeDeviceToken(userId: string, type: 'web' | 'mobile', token: string) {
    const field = type === 'web' ? 'webToken' : 'deviceToken';
    await this.userRepo.update(userId, { [field]: token });
    return { message: 'Token stored' };
  }

  async deleteAccount(userId: string) {
    await this.userRepo.softDelete(userId);
    return { message: 'Account deactivated successfully' };
  }

  async getProfile(userId: string) {
    return this.userRepo.findOne({ where: { id: userId }, relations: ['branch'] });
  }

  async getCustomerDashboard(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['branch'] });
    if (!user) throw new NotFoundException('User not found');

    const [totalVisits, spentResult, topCategoryRows, peakDayRows, peakTimeRows] = await Promise.all([
      this.orderRepo.count({ where: { userId } }),
      this.orderRepo
        .createQueryBuilder('o')
        .where('o.userId = :userId AND o.paymentStatus = :ps', { userId, ps: PaymentStatus.PAID })
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

  /** Create minimal customer at POS without full registration */
  async createPosCustomer(dto: { name: string; phone?: string; email?: string }) {
    const tempPassword = await bcrypt.hash(uuidv4(), 12);
    const existing = dto.email ? await this.userRepo.findOne({ where: { email: dto.email } }) : null;
    if (existing) return existing;

    const user = this.userRepo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      password: tempPassword,
      role: UserRole.CUSTOMER,
    });
    return this.userRepo.save(user);
  }

  private generateToken(user: User) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
