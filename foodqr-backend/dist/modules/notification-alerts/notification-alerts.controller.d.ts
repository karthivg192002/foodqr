import { NotificationAlertsService } from './notification-alerts.service';
export declare class NotificationAlertsController {
    private readonly service;
    constructor(service: NotificationAlertsService);
    findAll(): Promise<import("./entities/notification-alert.entity").NotificationAlert[]>;
    findOne(id: string): Promise<import("./entities/notification-alert.entity").NotificationAlert>;
    create(body: any): Promise<import("./entities/notification-alert.entity").NotificationAlert>;
    update(id: string, body: any): Promise<import("./entities/notification-alert.entity").NotificationAlert>;
}
