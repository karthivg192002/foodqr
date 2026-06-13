import { KdsService } from './kds.service';
import { OrderStatus } from '../../common/enums';
export declare class KdsController {
    private readonly kdsService;
    constructor(kdsService: KdsService);
    getOrders(branchId?: string): Promise<import("../orders/entities/order.entity").Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<import("../orders/entities/order.entity").Order>;
}
