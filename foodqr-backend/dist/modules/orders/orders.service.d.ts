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
import { TimeSlotsService } from '../time-slots/time-slots.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
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
    private timeSlotsService;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, orderAddressRepo: Repository<OrderAddress>, itemRepo: Repository<Item>, variationRepo: Repository<ItemVariation>, userRepo: Repository<User>, offerRepo: Repository<Offer>, offerItemRepo: Repository<OfferItem>, settingRepo: Repository<AppSetting>, stampRepo: Repository<LoyaltyStamp>, timeSlotsService: TimeSlotsService);
    private getSetting;
    private calculateDeliveryCharge;
    private applyOffer;
    private awardLoyaltyStamps;
    create(userId: string, dto: CreateOrderDto): Promise<Order>;
    findAll(filters?: {
        status?: string;
        orderType?: string;
        userId?: string;
        branchId?: string;
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
    getDashboardStats(): Promise<{
        totalOrders: number;
        todayOrders: number;
        totalRevenue: any;
        pendingOrders: number;
    }>;
    assignDeliveryBoy(orderId: string, deliveryBoyId: string): Promise<Order>;
    getOrdersByDeliveryBoy(deliveryBoyId: string, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    posChangeCalc(total: number, received: number): {
        change: number;
        sufficient: boolean;
    };
}
