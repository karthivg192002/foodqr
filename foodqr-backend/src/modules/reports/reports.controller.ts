import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('credit-balance')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getCreditBalance(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getCreditBalanceReport(startDate, endDate);
  }

  @Get('items')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getItemsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.reportsService.getItemsReport(startDate, endDate, categoryId);
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getAnalyticsSummary(startDate, endDate);
  }

  @Get('export/sales')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportSales(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getSalesReport(startDate || '2000-01-01', endDate || new Date().toISOString().split('T')[0]);
    const csv = ['Date,Orders,Revenue', ...data.map((r: any) => `${r.date},${r.ordercount},${r.revenue}`)].join('\n');
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="sales-report.csv"' });
    res.send(csv);
  }

  @Get('export/items')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportItems(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Res() res: Response) {
    const data = await this.reportsService.getItemsReport(startDate, endDate);
    const csv = ['Item,Category,Quantity Sold,Revenue,Avg Price', ...data.map((r: any) => `"${r.itemname}","${r.categoryname || ''}",${r.totalquantity},${r.totalrevenue},${r.avgprice}`)].join('\n');
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="items-report.csv"' });
    res.send(csv);
  }

  @Get('export/credit-balance')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportCreditBalance(@Res() res: Response) {
    const data = await this.reportsService.getCreditBalanceReport();
    const csv = ['Customer,Email,Total Credit,Total Debit,Balance', ...data.map((r: any) => `"${r.name}","${r.email}",${r.totalcredit},${r.totaldebit},${r.balance}`)].join('\n');
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="credit-balance-report.csv"' });
    res.send(csv);
  }

  @Get('export/customers')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportCustomers(@Res() res: Response) {
    const data = await this.reportsService.getCustomerStats();
    const csv = ['Name,Email,Orders,Total Spent', ...data.topCustomers.map((r: any) => `"${r.user_name}","${r.user_email}",${r.ordercount},${r.totalspent}`)].join('\n');
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="customers-report.csv"' });
    res.send(csv);
  }
}
