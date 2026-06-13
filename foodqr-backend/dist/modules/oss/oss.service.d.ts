import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
export declare class OssService {
    private orderRepo;
    constructor(orderRepo: Repository<Order>);
    getOssOrders(branchId?: string): Promise<Order[]>;
}
