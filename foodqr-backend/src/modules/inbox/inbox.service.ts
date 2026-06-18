import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxNotification } from './entities/inbox-notification.entity';

@Injectable()
export class InboxService {
  constructor(@InjectRepository(InboxNotification) private repo: Repository<InboxNotification>) {}

  async findByUser(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unreadCount = await this.repo.count({ where: { userId, isRead: false } });
    return { data, total, page, limit, unreadCount };
  }

  async markRead(id: string, userId: string) {
    await this.repo.update({ id, userId }, { isRead: true, readAt: new Date() });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    return { message: 'All notifications marked as read' };
  }

  async send(userId: string, title: string, body: string, options?: { modelType?: string; modelId?: string; data?: Record<string, any> }) {
    return this.repo.save(this.repo.create({ userId, title, body, ...options }));
  }

  async broadcastToAll(title: string, body: string, userIds: string[]) {
    const notifications = userIds.map((userId) => this.repo.create({ userId, title, body }));
    return this.repo.save(notifications);
  }

  async delete(id: string, userId: string) {
    await this.repo.delete({ id, userId });
    return { message: 'Notification deleted' };
  }
}
