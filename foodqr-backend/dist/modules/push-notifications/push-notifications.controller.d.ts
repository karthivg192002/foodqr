import { PushNotificationsService } from './push-notifications.service';
export declare class PushNotificationsController {
    private readonly service;
    constructor(service: PushNotificationsService);
    findAll(userId?: string, status?: string, page?: number, limit?: number): Promise<{
        data: import("./entities/push-notification.entity").PushNotification[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    send(dto: {
        userId?: string;
        title: string;
        body?: string;
        data?: object;
        target?: string;
        targetRole?: string;
    }): Promise<import("./entities/push-notification.entity").PushNotification>;
}
