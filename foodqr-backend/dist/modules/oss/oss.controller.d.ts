import { Observable } from 'rxjs';
import { OssService } from './oss.service';
import { OrdersService } from '../orders/orders.service';
import { EventsService } from '../events/events.service';
export declare class OssController {
    private readonly ossService;
    private readonly ordersService;
    private readonly eventsService;
    constructor(ossService: OssService, ordersService: OrdersService, eventsService: EventsService);
    getOrders(branchId?: string): Promise<import("../orders/entities/order.entity").Order[]>;
    getPopularItems(branchId?: string): Promise<any[]>;
    stream(branchId?: string): Observable<MessageEvent>;
}
