import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderAddress } from './entities/order-address.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offers/entities/offer.entity';
import { OfferItem } from '../offers/entities/offer-item.entity';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';
import { LoyaltyProgram } from '../loyalty/entities/loyalty-program.entity';
import { TimeSlotsService } from '../time-slots/time-slots.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from '../events/events.service';
import { DeliveryZonesService } from '../delivery-zones/delivery-zones.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { PaymentStatus } from '../../common/enums';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class OrdersService {
    private orderRepo;
    private orderItemRepo;
    private orderAddressRepo;
    private itemRepo;
    private variationRepo;
    private userRepo;
    private offerRepo;
    private offerItemRepo;
    private settingRepo;
    private stampRepo;
    private loyaltyProgramRepo;
    private timeSlotsService;
    private notificationsService;
    private eventsService;
    private deliveryZonesService;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, orderAddressRepo: Repository<OrderAddress>, itemRepo: Repository<Item>, variationRepo: Repository<ItemVariation>, userRepo: Repository<User>, offerRepo: Repository<Offer>, offerItemRepo: Repository<OfferItem>, settingRepo: Repository<AppSetting>, stampRepo: Repository<LoyaltyStamp>, loyaltyProgramRepo: Repository<LoyaltyProgram>, timeSlotsService: TimeSlotsService, notificationsService: NotificationsService, eventsService: EventsService, deliveryZonesService: DeliveryZonesService, connections: TenantConnectionService);
    private getSetting;
    private calculateDeliveryCharge;
    private applyOffer;
    private awardLoyaltyStamps;
    create(userId: string | null, dto: CreateOrderDto): Promise<Order>;
    findAll(filters?: {
        status?: string;
        orderType?: string;
        userId?: string;
        branchId?: string;
        diningTableId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<Order>;
    findByToken(token: string): Promise<Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order>;
    updatePaymentStatus(id: string, transactionId: string): Promise<Order>;
    getCustomerOrders(userId: string, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getKdsOrders(branchId?: string): Promise<Order[]>;
    getDashboardStats(startDate?: string, endDate?: string): Promise<{
        totalOrders: number;
        todayOrders: number;
        totalRevenue: any;
        pendingOrders: number;
        totalCustomers: number;
        ordersByStatus: Record<string, number>;
        totalDiscount: any;
        loyaltyStampsIssued: any;
        recentOrders: Order[];
        topSellingItems: any[];
    }>;
    cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order>;
    assignDeliveryBoy(orderId: string, deliveryBoyId: string): Promise<Order>;
    getOrdersByDeliveryBoy(deliveryBoyId: string, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getOssPopularItems(branchId?: string, limit?: number): Promise<any[]>;
    getStaffDashboard(staffId: string): Promise<{
        assignedOrders: Order[];
        totalHandled: number;
        pendingCount: number;
        preparingCount: number;
        preparedCount: number;
    }>;
    posChangeCalc(total: number, received: number): {
        change: number;
        sufficient: boolean;
    };
    changeOrderStaff(orderId: string, staffId: string): Promise<Order>;
    changePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order>;
    exportTableOrdersExcel(res: any): Promise<void>;
    getStaffDashboardWithKds(staffId: string): Promise<{
        kdsOrders: Order[];
        todayStats: {
            orderCount: number;
            revenue: number;
        };
        analytics: {
            efficiencyScore: number;
            avgOrderTimeMinutes: number;
            completedCount: number;
        };
        assignedOrders: Order[];
        totalHandled: number;
        pendingCount: number;
        preparingCount: number;
        preparedCount: number;
    }>;
}
