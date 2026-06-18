import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(): Promise<{
        totalOrders: number;
        todayOrders: number;
        totalCustomers: number;
        totalItems: number;
        totalTables: number;
        totalRevenue: number;
        todayRevenue: number;
        monthRevenue: number;
        pendingOrders: number;
        deliveredOrders: number;
    }>;
    getSales(startDate: string, endDate: string): Promise<any[]>;
    getTopItems(limit?: number, startDate?: string, endDate?: string): Promise<any[]>;
    getRevenueByType(startDate?: string, endDate?: string): Promise<any[]>;
    getCustomerStats(): Promise<{
        total: number;
        newThisMonth: number;
        topCustomers: any[];
    }>;
    getCreditBalance(startDate?: string, endDate?: string): Promise<any[]>;
    getItemsReport(startDate?: string, endDate?: string, categoryId?: string): Promise<any[]>;
    getAnalytics(startDate?: string, endDate?: string): Promise<{
        salesByDay: any[];
        revenueByType: any[];
        topItems: any[];
        newCustomers: number;
    }>;
    getCategoryWiseSales(startDate?: string, endDate?: string): Promise<any[]>;
    getHourlyPeak(startDate?: string, endDate?: string): Promise<any[]>;
    getStaffLeaderboard(startDate?: string, endDate?: string): Promise<any[]>;
    getQrRevenueSummary(startDate?: string, endDate?: string): Promise<any[]>;
    getCustomerStates(startDate?: string, endDate?: string): Promise<{
        totalCustomers: number;
        newCustomers: number;
        returningCustomers: number;
        guestCustomers: number;
        byRole: any[];
    }>;
    getPeakOrdersBarChart(startDate?: string, endDate?: string): Promise<{
        hourly: {
            hour: number;
            label: string;
            orderCount: number;
            revenue: number;
        }[];
        daily: {
            dayOfWeek: number;
            label: string;
            orderCount: number;
            revenue: number;
        }[];
    }>;
    getSalesOverview(startDate?: string, endDate?: string): Promise<{
        period: {
            startDate: string;
            endDate: string;
        };
        totalOrders: number;
        paidOrders: number;
        unpaidOrders: number;
        totalRevenue: number;
        avgOrderValue: number;
        topSellingItem: any;
    }>;
    exportSales(startDate: string, endDate: string, res: Response): Promise<void>;
    exportItems(startDate: string, endDate: string, res: Response): Promise<void>;
    exportCreditBalance(res: Response): Promise<void>;
    exportCustomers(res: Response): Promise<void>;
    exportSalesExcel(startDate: string, endDate: string, res: Response): Promise<void>;
    exportItemsExcel(startDate?: string, endDate?: string, res?: Response): Promise<void>;
    exportCustomersExcel(res: Response): Promise<void>;
    exportSalesPdf(startDate: string, endDate: string, res: Response): Promise<void>;
    exportItemsPdf(startDate?: string, endDate?: string, res?: Response): Promise<void>;
    private buildExcelHtml;
    private buildPrintHtml;
}
