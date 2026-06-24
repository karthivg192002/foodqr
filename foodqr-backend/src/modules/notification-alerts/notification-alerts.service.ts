import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationAlert } from './entities/notification-alert.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class NotificationAlertsService {
  constructor(
    @InjectRepository(NotificationAlert) private repo: Repository<NotificationAlert>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, NotificationAlert, repo);
  }

  findAll() { return this.repo.find(); }

  async findOne(id: string) {
    const alert = await this.repo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Notification alert not found');
    return alert;
  }

  create(dto: Partial<NotificationAlert>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: Partial<NotificationAlert>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async findByLanguage(language: string) {
    return this.repo.findOne({ where: { language } });
  }
}
