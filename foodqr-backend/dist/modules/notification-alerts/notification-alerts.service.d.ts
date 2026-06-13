import { Repository } from 'typeorm';
import { NotificationAlert } from './entities/notification-alert.entity';
export declare class NotificationAlertsService {
    private repo;
    constructor(repo: Repository<NotificationAlert>);
    findAll(): Promise<NotificationAlert[]>;
    findOne(id: string): Promise<NotificationAlert>;
    create(dto: Partial<NotificationAlert>): Promise<NotificationAlert>;
    update(id: string, dto: Partial<NotificationAlert>): Promise<NotificationAlert>;
    findByLanguage(language: string): Promise<NotificationAlert>;
}
