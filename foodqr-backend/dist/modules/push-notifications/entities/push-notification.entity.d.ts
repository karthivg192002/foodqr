import { User } from '../../users/entities/user.entity';
export declare class PushNotification {
    id: string;
    userId: string;
    user: User;
    title: string;
    body: string;
    data: object;
    target: string;
    targetRole: string;
    status: string;
    errorMessage: string;
    createdAt: Date;
}
