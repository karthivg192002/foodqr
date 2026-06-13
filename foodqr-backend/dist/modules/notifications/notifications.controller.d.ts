import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    broadcast(dto: {
        title: string;
        body: string;
    }): Promise<{
        sent: number;
    }>;
    sendEmail(dto: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
}
