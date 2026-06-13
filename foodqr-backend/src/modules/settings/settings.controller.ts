import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  getAll(@Query('group') group?: string) { return this.settingsService.getAll(group); }

  @Get('company')
  @Roles(UserRole.ADMIN)
  getCompany() { return this.settingsService.getCompanySettings(); }

  @Post('company')
  @Roles(UserRole.ADMIN)
  setCompany(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'company');
  }

  @Get('site')
  @Roles(UserRole.ADMIN)
  getSite() { return this.settingsService.getSiteSettings(); }

  @Post('site')
  @Roles(UserRole.ADMIN)
  setSite(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'site');
  }

  @Get('mail')
  @Roles(UserRole.ADMIN)
  getMail() { return this.settingsService.getMailSettings(); }

  @Post('mail')
  @Roles(UserRole.ADMIN)
  setMail(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'mail');
  }

  @Get('payment')
  @Roles(UserRole.ADMIN)
  getPayment() { return this.settingsService.getPaymentSettings(); }

  @Post('payment')
  @Roles(UserRole.ADMIN)
  setPayment(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'payment');
  }

  @Get('sms')
  @Roles(UserRole.ADMIN)
  getSms() { return this.settingsService.getSmsSettings(); }

  @Post('sms')
  @Roles(UserRole.ADMIN)
  setSms(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'sms');
  }

  @Get('business')
  @Roles(UserRole.ADMIN)
  getBusiness() { return this.settingsService.getBusinessSettings(); }

  @Post('business')
  @Roles(UserRole.ADMIN)
  setBusiness(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'business');
  }

  @Get('order')
  @Roles(UserRole.ADMIN)
  getOrder() { return this.settingsService.getOrderSettings(); }

  @Post('order')
  @Roles(UserRole.ADMIN)
  setOrder(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'order');
  }

  @Get('notification')
  @Roles(UserRole.ADMIN)
  getNotification() { return this.settingsService.getNotificationSettings(); }

  @Post('notification')
  @Roles(UserRole.ADMIN)
  setNotification(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'notification');
  }

  @Get('order_setup')
  @Roles(UserRole.ADMIN)
  getOrderSetup() { return this.settingsService.getAll('order_setup'); }

  @Post('order_setup')
  @Roles(UserRole.ADMIN)
  setOrderSetup(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'order_setup');
  }

  @Get('social_media')
  @Roles(UserRole.ADMIN)
  getSocialMedia() { return this.settingsService.getAll('social_media'); }

  @Post('social_media')
  @Roles(UserRole.ADMIN)
  setSocialMedia(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'social_media');
  }

  @Get('theme')
  @Roles(UserRole.ADMIN)
  getTheme() { return this.settingsService.getAll('theme'); }

  @Post('theme')
  @Roles(UserRole.ADMIN)
  setTheme(@Body() settings: Record<string, string>) {
    return this.settingsService.setMany(settings, 'theme');
  }

  @Public()
  @Get('public')
  getPublic() { return this.settingsService.getPublicSettings(); }
}
