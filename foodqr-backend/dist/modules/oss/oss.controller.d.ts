import { OssService } from './oss.service';
export declare class OssController {
    private readonly ossService;
    constructor(ossService: OssService);
    getOrders(branchId?: string): Promise<import("../orders/entities/order.entity").Order[]>;
}
