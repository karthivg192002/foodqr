import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class OssService {
    private orderRepo;
    constructor(orderRepo: Repository<Order>, connections: TenantConnectionService);
    getOssOrders(branchId?: string): Promise<Order[]>;
}
