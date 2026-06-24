import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class KdsService {
    private orderRepo;
    constructor(orderRepo: Repository<Order>, connections: TenantConnectionService);
    getKdsOrders(branchId?: string): Promise<Order[]>;
    updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
}
