import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('loyalty/dashboard')
  getMyDashboard(@CurrentUser() user: User) {
    return this.loyaltyService.getUserDashboard(user.id);
  }

  @Get('loyalty/stamps')
  getMyStamps(@CurrentUser() user: User) {
    return this.loyaltyService.getCustomerStamps(user.id);
  }

  @Post('loyalty/redeem/:rewardId')
  redeemReward(@CurrentUser() user: User, @Param('rewardId', ParseUUIDPipe) rewardId: string) {
    return this.loyaltyService.redeemReward(user.id, rewardId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/loyalty/programs')
  getPrograms() { return this.loyaltyService.getPrograms(); }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/loyalty/programs')
  createProgram(@Body() data: any) { return this.loyaltyService.createProgram(data); }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/loyalty/programs/:id')
  updateProgram(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.loyaltyService.updateProgram(id, data);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/loyalty/programs/:id/configurations')
  addConfiguration(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.loyaltyService.addConfiguration(id, data);
  }
}
