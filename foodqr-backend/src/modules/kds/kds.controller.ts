import { Controller, Get, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KdsService } from './kds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole, OrderStatus } from '../../common/enums';

@ApiTags('KDS - Kitchen Display')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/kds')
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.CHEF, UserRole.STAFF)
  getOrders(@Query('branchId') branchId?: string) {
    return this.kdsService.getKdsOrders(branchId);
  }

  @Patch('orders/:id/status')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.CHEF, UserRole.STAFF)
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: OrderStatus) {
    return this.kdsService.updateStatus(id, status);
  }
}
