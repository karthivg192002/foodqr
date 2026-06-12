import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getDashboard() { return this.reportsService.getDashboardSummary(); }

  @Get('sales')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getSales(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('top-items')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getTopItems(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getTopItems(limit || 10, startDate, endDate);
  }

  @Get('revenue-by-type')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getRevenueByType(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getRevenueByOrderType(startDate, endDate);
  }

  @Get('customers')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getCustomerStats() { return this.reportsService.getCustomerStats(); }
}
