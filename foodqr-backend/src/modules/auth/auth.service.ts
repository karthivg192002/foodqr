import {
  Injectable, BadRequestException, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';
import {
  LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto,
  ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
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

  async sendOtp(dto: OtpRequestDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      await this.userRepo.update(user.id, { otpCode: otp, otpExpiry: expiry });
    }
    return { message: 'OTP sent successfully', otp };
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
    return { message: 'OTP verified successfully' };
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
    return { message: 'Password reset link sent', token };
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

  async getProfile(userId: string) {
    return this.userRepo.findOne({ where: { id: userId }, relations: ['branch'] });
  }

  private generateToken(user: User) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
