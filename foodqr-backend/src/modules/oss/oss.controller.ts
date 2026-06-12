import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OssService } from './oss.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('OSS - Order Status Screen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF)
  getOrders(@Query('branchId') branchId?: string) {
    return this.ossService.getOssOrders(branchId);
  }
}
