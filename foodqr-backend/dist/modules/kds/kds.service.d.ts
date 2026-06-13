import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';
export declare class KdsService {
    private orderRepo;
    constructor(orderRepo: Repository<Order>);
    getKdsOrders(branchId?: string): Promise<Order[]>;
    updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
}
