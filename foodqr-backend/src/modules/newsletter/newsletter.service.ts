import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscriber) private subRepo: Repository<Subscriber>,
    connections: TenantConnectionService,
  ) {
    this.subRepo = tenantAwareRepo(connections, Subscriber, subRepo);
  }

  async subscribe(email: string) {
    const existing = await this.subRepo.findOne({ where: { email } });
    if (existing) {
      if (existing.status === 'active') throw new ConflictException('Already subscribed');
      await this.subRepo.update(existing.id, { status: 'active' });
      return { message: 'Resubscribed successfully' };
    }
    await this.subRepo.save(this.subRepo.create({ email, status: 'active' }));
    return { message: 'Subscribed successfully' };
  }

  async unsubscribe(email: string) {
    const sub = await this.subRepo.findOne({ where: { email } });
    if (!sub) throw new NotFoundException('Email not found');
    await this.subRepo.update(sub.id, { status: 'unsubscribed' });
    return { message: 'Unsubscribed successfully' };
  }

  findAll() {
    return this.subRepo.find({ order: { createdAt: 'DESC' } });
  }

  findActive() {
    return this.subRepo.find({ where: { status: 'active' }, order: { createdAt: 'DESC' } });
  }
}
