"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboard() { return this.reportsService.getDashboardSummary(); }
    getSales(startDate, endDate) {
        return this.reportsService.getSalesReport(startDate, endDate);
    }
    getTopItems(limit, startDate, endDate) {
        return this.reportsService.getTopItems(limit || 10, startDate, endDate);
    }
    getRevenueByType(startDate, endDate) {
        return this.reportsService.getRevenueByOrderType(startDate, endDate);
    }
    getCustomerStats() { return this.reportsService.getCustomerStats(); }
    getCreditBalance(startDate, endDate) {
        return this.reportsService.getCreditBalanceReport(startDate, endDate);
    }
    getItemsReport(startDate, endDate, categoryId) {
        return this.reportsService.getItemsReport(startDate, endDate, categoryId);
    }
    getAnalytics(startDate, endDate) {
        return this.reportsService.getAnalyticsSummary(startDate, endDate);
    }
    getCategoryWiseSales(startDate, endDate) {
        return this.reportsService.getCategoryWiseSales(startDate, endDate);
    }
    getHourlyPeak(startDate, endDate) {
        return this.reportsService.getHourlyPeakOrders(startDate, endDate);
    }
    getStaffLeaderboard(startDate, endDate) {
        return this.reportsService.getStaffLeaderboard(startDate, endDate);
    }
    getQrRevenueSummary(startDate, endDate) {
        return this.reportsService.getQrRevenueSummary(startDate, endDate);
    }
    getCustomerStates(startDate, endDate) {
        return this.reportsService.getCustomerStates(startDate, endDate);
    }
    getPeakOrdersBarChart(startDate, endDate) {
        return this.reportsService.getPeakOrdersBarChart(startDate, endDate);
    }
    getSalesOverview(startDate, endDate) {
        return this.reportsService.getSalesOverview(startDate, endDate);
    }
    async exportSales(startDate, endDate, res) {
        const data = await this.reportsService.getSalesReport(startDate || '2000-01-01', endDate || new Date().toISOString().split('T')[0]);
        const csv = ['Date,Orders,Revenue', ...data.map((r) => `${r.date},${r.ordercount},${r.revenue}`)].join('\n');
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="sales-report.csv"' });
        res.send(csv);
    }
    async exportItems(startDate, endDate, res) {
        const data = await this.reportsService.getItemsReport(startDate, endDate);
        const csv = ['Item,Category,Quantity Sold,Revenue,Avg Price', ...data.map((r) => `"${r.itemname}","${r.categoryname || ''}",${r.totalquantity},${r.totalrevenue},${r.avgprice}`)].join('\n');
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="items-report.csv"' });
        res.send(csv);
    }
    async exportCreditBalance(res) {
        const data = await this.reportsService.getCreditBalanceReport();
        const csv = ['Customer,Email,Total Credit,Total Debit,Balance', ...data.map((r) => `"${r.name}","${r.email}",${r.totalcredit},${r.totaldebit},${r.balance}`)].join('\n');
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="credit-balance-report.csv"' });
        res.send(csv);
    }
    async exportCustomers(res) {
        const data = await this.reportsService.getCustomerStats();
        const csv = ['Name,Email,Orders,Total Spent', ...data.topCustomers.map((r) => `"${r.user_name}","${r.user_email}",${r.ordercount},${r.totalspent}`)].join('\n');
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="customers-report.csv"' });
        res.send(csv);
    }
    async exportSalesExcel(startDate, endDate, res) {
        const data = await this.reportsService.getSalesReport(startDate || '2000-01-01', endDate || new Date().toISOString().split('T')[0]);
        const html = this.buildExcelHtml('Sales Report', ['Date', 'Orders', 'Revenue'], data.map((r) => [r.date, r.ordercount, r.revenue]));
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="sales-report.xls"' });
        res.send(html);
    }
    async exportItemsExcel(startDate, endDate, res) {
        const data = await this.reportsService.getItemsReport(startDate, endDate);
        const html = this.buildExcelHtml('Items Report', ['Item', 'Category', 'Qty Sold', 'Revenue', 'Avg Price'], data.map((r) => [r.itemname, r.categoryname, r.totalquantity, r.totalrevenue, r.avgprice]));
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="items-report.xls"' });
        res.send(html);
    }
    async exportCustomersExcel(res) {
        const data = await this.reportsService.getCustomerStats();
        const html = this.buildExcelHtml('Customers Report', ['Name', 'Email', 'Orders', 'Total Spent'], data.topCustomers.map((r) => [r.user_name, r.user_email, r.ordercount, r.totalspent]));
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="customers-report.xls"' });
        res.send(html);
    }
    async exportSalesPdf(startDate, endDate, res) {
        const data = await this.reportsService.getSalesReport(startDate || '2000-01-01', endDate || new Date().toISOString().split('T')[0]);
        const html = this.buildPrintHtml('Sales Report', ['Date', 'Orders', 'Revenue'], data.map((r) => [r.date, r.ordercount, Number(r.revenue).toFixed(2)]), startDate, endDate);
        res.set({ 'Content-Type': 'text/html', 'Content-Disposition': 'inline; filename="sales-report.html"' });
        res.send(html);
    }
    async exportItemsPdf(startDate, endDate, res) {
        const data = await this.reportsService.getItemsReport(startDate, endDate);
        const html = this.buildPrintHtml('Items Report', ['Item', 'Category', 'Qty', 'Revenue', 'Avg Price'], data.map((r) => [r.itemname, r.categoryname, r.totalquantity, Number(r.totalrevenue).toFixed(2), Number(r.avgprice).toFixed(2)]), startDate, endDate);
        res.set({ 'Content-Type': 'text/html', 'Content-Disposition': 'inline; filename="items-report.html"' });
        res.send(html);
    }
    buildExcelHtml(title, headers, rows) {
        const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
        const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
        return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>${title}</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
    }
    buildPrintHtml(title, headers, rows, startDate, endDate) {
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
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sales'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSales", null);
__decorate([
    (0, common_1.Get)('top-items'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopItems", null);
__decorate([
    (0, common_1.Get)('revenue-by-type'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRevenueByType", null);
__decorate([
    (0, common_1.Get)('customers'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCustomerStats", null);
__decorate([
    (0, common_1.Get)('credit-balance'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCreditBalance", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getItemsReport", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('category-wise-sales'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCategoryWiseSales", null);
__decorate([
    (0, common_1.Get)('hourly-peak'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getHourlyPeak", null);
__decorate([
    (0, common_1.Get)('staff-leaderboard'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getStaffLeaderboard", null);
__decorate([
    (0, common_1.Get)('qr-revenue-summary'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getQrRevenueSummary", null);
__decorate([
    (0, common_1.Get)('customer-states'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCustomerStates", null);
__decorate([
    (0, common_1.Get)('peak-orders-bar-chart'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getPeakOrdersBarChart", null);
__decorate([
    (0, common_1.Get)('sales-overview'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSalesOverview", null);
__decorate([
    (0, common_1.Get)('export/sales'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportSales", null);
__decorate([
    (0, common_1.Get)('export/items'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportItems", null);
__decorate([
    (0, common_1.Get)('export/credit-balance'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCreditBalance", null);
__decorate([
    (0, common_1.Get)('export/customers'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCustomers", null);
__decorate([
    (0, common_1.Get)('export/sales/excel'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportSalesExcel", null);
__decorate([
    (0, common_1.Get)('export/items/excel'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportItemsExcel", null);
__decorate([
    (0, common_1.Get)('export/customers/excel'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCustomersExcel", null);
__decorate([
    (0, common_1.Get)('export/sales/pdf'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportSalesPdf", null);
__decorate([
    (0, common_1.Get)('export/items/pdf'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportItemsPdf", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports & Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map