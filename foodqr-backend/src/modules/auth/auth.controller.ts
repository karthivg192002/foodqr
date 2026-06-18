import { Controller, Post, Get, Delete, Body, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto,
  ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('guest')
  @ApiOperation({ summary: 'Create a guest user for checkout without registration' })
  guestSignup(@Body() dto: { name: string; phone?: string }) {
    return this.authService.guestSignup(dto);
  }

  @Public()
  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to email (also creates inactive placeholder if new email)' })
  sendOtp(@Body() dto: OtpRequestDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP' })
  verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link via email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('customer/dashboard')
  @ApiOperation({ summary: 'Customer dashboard summary (wallet, name, profile)' })
  getCustomerDashboard(@CurrentUser() user: User) {
    return this.authService.getCustomerDashboard(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('change-password')
  @ApiOperation({ summary: 'Change password' })
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('account')
  @ApiOperation({ summary: 'Deactivate / soft-delete own account' })
  deleteAccount(@CurrentUser() user: User) {
    return this.authService.deleteAccount(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('pos/customer')
  @ApiOperation({ summary: 'Quick-create a customer at POS without full registration' })
  createPosCustomer(@Body() dto: { name: string; phone?: string; email?: string }) {
    return this.authService.createPosCustomer(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('device-token')
  @ApiOperation({ summary: 'Store FCM/web-push device token for the current user' })
  storeDeviceToken(
    @CurrentUser() user: User,
    @Body() dto: { type: 'web' | 'mobile'; token: string },
  ) {
    return this.authService.storeDeviceToken(user.id, dto.type, dto.token);
  }

  /** Guest phone OTP signup — send OTP without account creation */
  @Public()
  @Post('guest/send-otp')
  @ApiOperation({ summary: 'Guest: send OTP to phone (no registration required)' })
  sendGuestOtp(@Body() body: { phone: string }) {
    return this.authService.sendPhoneOtp(body.phone);
  }

  /** Guest phone OTP signup — verify and create a guest session */
  @Public()
  @Post('guest/verify')
  @ApiOperation({ summary: 'Guest: verify phone OTP and create guest session' })
  async verifyGuestOtp(@Body() body: { phone: string; otp: string }) {
    await this.authService.verifyPhoneOtp(body.phone, body.otp);
    return this.authService.registerViaPhone(body.phone, 'Guest');
  }

  /** Phone OTP signup — step 1: send OTP */
  @Public()
  @Post('phone/send-otp')
  @ApiOperation({ summary: 'Step 1: send OTP to phone number for signup/login' })
  sendPhoneOtp(@Body() body: { phone: string }) {
    return this.authService.sendPhoneOtp(body.phone);
  }

  /** Phone OTP signup — step 2: verify OTP */
  @Public()
  @Post('phone/verify')
  @ApiOperation({ summary: 'Step 2: verify phone OTP' })
  verifyPhoneOtp(@Body() body: { phone: string; otp: string }) {
    return this.authService.verifyPhoneOtp(body.phone, body.otp);
  }

  /** Phone OTP signup — step 3: complete registration or login */
  @Public()
  @Post('phone/register')
  @ApiOperation({ summary: 'Step 3: complete phone-based registration or login' })
  registerViaPhone(@Body() body: { phone: string; name?: string; password?: string }) {
    return this.authService.registerViaPhone(body.phone, body.name, body.password);
  }

  /** Forgot password via phone OTP */
  @Public()
  @Post('forgot-password/phone')
  @ApiOperation({ summary: 'Request password reset via phone OTP' })
  forgotPasswordPhone(@Body() body: { phone: string }) {
    return this.authService.forgotPasswordPhone(body.phone);
  }

  /** Reset password after phone OTP verification */
  @Public()
  @Post('reset-password/phone')
  @ApiOperation({ summary: 'Reset password after phone OTP verification' })
  resetPasswordPhone(@Body() body: { phone: string; otp: string; password: string }) {
    return this.authService.resetPasswordPhone(body.phone, body.otp, body.password);
  }

  /** Admin impersonation — get a token for any user */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('impersonate/:userId')
  @ApiOperation({ summary: 'Admin: generate token to impersonate another user' })
  impersonate(@CurrentUser() admin: User, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.authService.impersonate(admin.id, userId);
  }
}
