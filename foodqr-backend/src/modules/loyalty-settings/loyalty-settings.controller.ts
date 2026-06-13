import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { LoyaltySettingsService } from './loyalty-settings.service';

@ApiTags('Loyalty Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
@Controller('admin/loyalty-settings')
export class LoyaltySettingsController {
  constructor(private readonly service: LoyaltySettingsService) {}

  @Get()
  async findAll() {
    const rows = await this.service.findAll();
    return rows.reduce((acc: any, r: any) => ({ ...acc, [r.key]: r.value }), {});
  }

  @Get('thresholds')
  getThresholds() { return this.service.getThresholds(); }

  @Post('bulk')
  async bulkSet(@Body() body: { settings: Record<string, string> }) {
    const entries = Object.entries(body.settings).map(([key, value]) => ({ key, value }));
    return this.service.bulkSet(entries);
  }
}
