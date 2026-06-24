import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Item } from '../menu/items/entities/item.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class ReportsService {
    private orderRepo;
    private orderItemRepo;
    private userRepo;
    private itemRepo;
    private tableRepo;
    private transactionRepo;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, userRepo: Repository<User>, itemRepo: Repository<Item>, tableRepo: Repository<DiningTable>, transactionRepo: Repository<Transaction>, connections: TenantConnectionService);
    getDashboardSummary(): Promise<{
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
    getSalesReport(startDate: string, endDate: string): Promise<any[]>;
    getTopItems(limit?: number, startDate?: string, endDate?: string): Promise<any[]>;
    getRevenueByOrderType(startDate?: string, endDate?: string): Promise<any[]>;
    getCreditBalanceReport(startDate?: string, endDate?: string): Promise<any[]>;
    getItemsReport(startDate?: string, endDate?: string, categoryId?: string): Promise<any[]>;
    getAnalyticsSummary(startDate?: string, endDate?: string): Promise<{
        salesByDay: any[];
        revenueByType: any[];
        topItems: any[];
        newCustomers: number;
    }>;
    getCategoryWiseSales(startDate?: string, endDate?: string): Promise<any[]>;
    getHourlyPeakOrders(startDate?: string, endDate?: string): Promise<any[]>;
    getStaffLeaderboard(startDate?: string, endDate?: string): Promise<any[]>;
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
    getCustomerStats(): Promise<{
        total: number;
        newThisMonth: number;
        topCustomers: any[];
    }>;
}
