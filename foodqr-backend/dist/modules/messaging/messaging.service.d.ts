import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageHistory } from './entities/message-history.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class MessagingService {
    private msgRepo;
    private historyRepo;
    constructor(msgRepo: Repository<Message>, historyRepo: Repository<MessageHistory>, connections: TenantConnectionService);
    getOrCreateThread(userId: string, branchId: string): Promise<Message>;
    getThreadsForBranch(branchId: string): Promise<Message[]>;
    getHistory(messageId: string): Promise<MessageHistory[]>;
    sendMessage(messageId: string, userId: string, text: string): Promise<MessageHistory>;
    markRead(messageId: string): Promise<{
        message: string;
    }>;
}
