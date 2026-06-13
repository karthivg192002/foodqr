import { User } from '../../users/entities/user.entity';
export declare class Message {
    id: string;
    branchId: string;
    userId: string;
    user: User;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}
