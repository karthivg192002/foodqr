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
}
