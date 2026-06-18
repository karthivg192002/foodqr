import { Observable } from 'rxjs';
import { KdsService } from './kds.service';
import { EventsService } from '../events/events.service';
import { OrderStatus } from '../../common/enums';
export declare class KdsController {
    private readonly kdsService;
    private readonly eventsService;
    constructor(kdsService: KdsService, eventsService: EventsService);
    getOrders(branchId?: string): Promise<import("../orders/entities/order.entity").Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<import("../orders/entities/order.entity").Order>;
    stream(branchId?: string): Observable<MessageEvent>;
}
