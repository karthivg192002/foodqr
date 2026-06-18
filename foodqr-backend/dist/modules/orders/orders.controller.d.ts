import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { User } from '../users/entities/user.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: User, dto: CreateOrderDto): Promise<import("./entities/order.entity").Order>;
    findAll(status?: string, orderType?: string, search?: string, page?: number, limit?: number): Promise<{
        data: import("./entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getMyOrders(user: User, page?: number, limit?: number): Promise<{
        data: import("./entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    trackByToken(token: string): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("./entities/order.entity").Order>;
    getKdsOrders(branchId?: string): Promise<import("./entities/order.entity").Order[]>;
    getDashboardStats(startDate?: string, endDate?: string): Promise<{
        totalOrders: number;
        todayOrders: number;
        totalRevenue: any;
        pendingOrders: number;
        totalCustomers: number;
        ordersByStatus: Record<string, number>;
        totalDiscount: any;
        loyaltyStampsIssued: any;
        recentOrders: import("./entities/order.entity").Order[];
        topSellingItems: any[];
    }>;
    cancelOrder(id: string, user: User, body: {
        reason?: string;
    }): Promise<import("./entities/order.entity").Order>;
    assignDeliveryBoy(id: string, body: {
        deliveryBoyId: string;
    }): Promise<import("./entities/order.entity").Order>;
    getDeliveryBoyOrders(deliveryBoyId: string, page?: number, limit?: number): Promise<{
        data: import("./entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getStaffDashboard(user: User): Promise<{
        kdsOrders: import("./entities/order.entity").Order[];
        todayStats: {
            orderCount: number;
            revenue: number;
        };
        assignedOrders: import("./entities/order.entity").Order[];
        totalHandled: number;
        pendingCount: number;
        preparingCount: number;
        preparedCount: number;
    }>;
    getPosChange(id: string, received: number): Promise<{
        change: number;
        sufficient: boolean;
    }>;
    changeOrderStaff(id: string, body: {
        staffId: string;
    }): Promise<import("./entities/order.entity").Order>;
    changePaymentStatus(id: string, body: {
        paymentStatus: string;
    }): Promise<import("./entities/order.entity").Order>;
    exportTableOrders(res: Response): Promise<void>;
    getPosOrders(status?: string, search?: string, page?: number, limit?: number): Promise<{
        data: import("./entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
}
