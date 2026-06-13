import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';
export declare class MessageHistory {
    id: string;
    messageId: string;
    message: Message;
    userId: string;
    user: User;
    text: string;
    isRead: boolean;
    createdAt: Date;
}
