import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
export declare class NotificationsService {
    private userRepo;
    private configService;
    private readonly logger;
    private firebaseInitialized;
    private transporter;
    constructor(userRepo: Repository<User>, configService: ConfigService);
    private initFirebase;
    private initEmail;
    sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
    sendOrderNotification(userId: string, orderSerial: string, status: string): Promise<void>;
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    broadcastToAll(title: string, body: string): Promise<{
        sent: number;
    }>;
}
