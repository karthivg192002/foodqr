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

  @Get('category-wise-sales')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getCategoryWiseSales(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getCategoryWiseSales(startDate, endDate);
  }

  @Get('hourly-peak')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getHourlyPeak(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getHourlyPeakOrders(startDate, endDate);
  }

  @Get('staff-leaderboard')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getStaffLeaderboard(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getStaffLeaderboard(startDate, endDate);
  }

  @Get('qr-revenue-summary')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getQrRevenueSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getQrRevenueSummary(startDate, endDate);
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

  // ── Excel exports (HTML table format — opens directly in Excel) ──

  @Get('export/sales/excel')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportSalesExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getSalesReport(startDate || '2000-01-01', endDate || new Date().toISOString().split('T')[0]);
    const html = this.buildExcelHtml('Sales Report', ['Date', 'Orders', 'Revenue'], data.map((r: any) => [r.date, r.ordercount, r.revenue]));
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="sales-report.xls"' });
    res.send(html);
  }

  @Get('export/items/excel')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportItemsExcel(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Res() res?: Response) {
    const data = await this.reportsService.getItemsReport(startDate, endDate);
    const html = this.buildExcelHtml('Items Report', ['Item', 'Category', 'Qty Sold', 'Revenue', 'Avg Price'], data.map((r: any) => [r.itemname, r.categoryname, r.totalquantity, r.totalrevenue, r.avgprice]));
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="items-report.xls"' });
    res.send(html);
  }

  @Get('export/customers/excel')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportCustomersExcel(@Res() res: Response) {
    const data = await this.reportsService.getCustomerStats();
    const html = this.buildExcelHtml('Customers Report', ['Name', 'Email', 'Orders', 'Total Spent'], data.topCustomers.map((r: any) => [r.user_name, r.user_email, r.ordercount, r.totalspent]));
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="customers-report.xls"' });
    res.send(html);
  }

  // ── PDF export (print-friendly HTML) ──

  @Get('export/sales/pdf')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportSalesPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getSalesReport(startDate || '2000-01-01', endDate || new Date().toISOString().split('T')[0]);
    const html = this.buildPrintHtml('Sales Report', ['Date', 'Orders', 'Revenue'], data.map((r: any) => [r.date, r.ordercount, Number(r.revenue).toFixed(2)]), startDate, endDate);
    res.set({ 'Content-Type': 'text/html', 'Content-Disposition': 'inline; filename="sales-report.html"' });
    res.send(html);
  }

  @Get('export/items/pdf')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportItemsPdf(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Res() res?: Response) {
    const data = await this.reportsService.getItemsReport(startDate, endDate);
    const html = this.buildPrintHtml('Items Report', ['Item', 'Category', 'Qty', 'Revenue', 'Avg Price'], data.map((r: any) => [r.itemname, r.categoryname, r.totalquantity, Number(r.totalrevenue).toFixed(2), Number(r.avgprice).toFixed(2)]), startDate, endDate);
    res.set({ 'Content-Type': 'text/html', 'Content-Disposition': 'inline; filename="items-report.html"' });
    res.send(html);
  }

  private buildExcelHtml(title: string, headers: string[], rows: any[][]): string {
    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>${title}</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
  }

  private buildPrintHtml(title: string, headers: string[], rows: any[][], startDate?: string, endDate?: string): string {
    const ths = headers.map((h) => `<th>${h}</th>`).join('');
    const trs = rows.map((r, i) => `<tr class="${i % 2 === 0 ? 'even' : ''}">${r.map((c) => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('');
    const period = startDate && endDate ? `<p class="period">Period: ${startDate} to ${endDate}</p>` : '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>
      body{font-family:Arial,sans-serif;margin:24px;color:#333}
      h1{color:#f97316;margin-bottom:4px}
      .period{color:#666;font-size:13px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#f97316;color:white;padding:8px 12px;text-align:left}
      td{padding:7px 12px;border-bottom:1px solid #eee}
      tr.even td{background:#fafafa}
      @media print{button{display:none}}
    </style></head><body>
    <h1>${title}</h1>${period}
    <button onclick="window.print()" style="margin-bottom:16px;background:#f97316;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">🖨️ Print</button>
    <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
    <script>setTimeout(()=>window.print(),500)</script>
    </body></html>`;
  }
}
