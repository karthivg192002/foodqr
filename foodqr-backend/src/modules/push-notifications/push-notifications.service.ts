import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushNotification } from './entities/push-notification.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class PushNotificationsService {
  constructor(
    @InjectRepository(PushNotification) private repo: Repository<PushNotification>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, PushNotification, repo);
  }

  async send(dto: {
    userId?: string;
    title: string;
    body?: string;
    data?: object;
    target?: string;
    targetRole?: string;
  }) {
    const log = this.repo.create({
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      data: dto.data,
      target: dto.target || 'user',
      targetRole: dto.targetRole,
      status: 'sent',
    });
    return this.repo.save(log);
  }

  findAll(filters: { userId?: string; status?: string; page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20, userId, status } = filters;
    const qb = this.repo.createQueryBuilder('pn')
      .leftJoinAndSelect('pn.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('pn.createdAt', 'DESC');

    if (userId) qb.andWhere('pn.userId = :userId', { userId });
    if (status) qb.andWhere('pn.status = :status', { status });

    return qb.getManyAndCount().then(([data, total]) => ({
      data, total, page, limit, pages: Math.ceil(total / limit),
    }));
  }
}
