import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LicenseService } from './license.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('License')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  getLicenseInfo() { return this.licenseService.getLicenseInfo(); }

  @Get('check')
  @Roles(UserRole.ADMIN)
  checkLicense() { return this.licenseService.checkLicense(); }

  @Post('activate')
  @Roles(UserRole.ADMIN)
  activateLicense(@Body() body: { licenseKey: string; email: string }) {
    return this.licenseService.activateLicense(body.licenseKey, body.email);
  }

  @Post('deactivate')
  @Roles(UserRole.ADMIN)
  deactivateLicense() { return this.licenseService.deactivateLicense(); }
}
