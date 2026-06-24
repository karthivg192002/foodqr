import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageHistory } from './entities/message-history.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(MessageHistory) private historyRepo: Repository<MessageHistory>,
    connections: TenantConnectionService,
  ) {
    this.msgRepo = tenantAwareRepo(connections, Message, msgRepo);
    this.historyRepo = tenantAwareRepo(connections, MessageHistory, historyRepo);
  }

  async getOrCreateThread(userId: string, branchId: string) {
    let thread = await this.msgRepo.findOne({ where: { userId, branchId } });
    if (!thread) {
      thread = await this.msgRepo.save(this.msgRepo.create({ userId, branchId }));
    }
    return thread;
  }

  async getThreadsForBranch(branchId: string) {
    return this.msgRepo.find({ where: { branchId }, relations: ['user'], order: { updatedAt: 'DESC' } });
  }

  async getHistory(messageId: string) {
    return this.historyRepo.find({ where: { messageId }, order: { createdAt: 'ASC' } });
  }

  async sendMessage(messageId: string, userId: string, text: string) {
    const thread = await this.msgRepo.findOne({ where: { id: messageId } });
    if (!thread) throw new NotFoundException('Thread not found');
    const history = await this.historyRepo.save(
      this.historyRepo.create({ messageId, userId, text }),
    );
    await this.msgRepo.update(messageId, { updatedAt: new Date() } as any);
    return history;
  }

  async markRead(messageId: string) {
    await this.historyRepo.update({ messageId, isRead: false }, { isRead: true });
    return { message: 'Marked as read' };
  }
}
