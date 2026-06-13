import { Repository } from 'typeorm';
import { PushNotification } from './entities/push-notification.entity';
export declare class PushNotificationsService {
    private repo;
    constructor(repo: Repository<PushNotification>);
    send(dto: {
        userId?: string;
        title: string;
        body?: string;
        data?: object;
        target?: string;
        targetRole?: string;
    }): Promise<PushNotification>;
    findAll(filters?: {
        userId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: PushNotification[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
}
