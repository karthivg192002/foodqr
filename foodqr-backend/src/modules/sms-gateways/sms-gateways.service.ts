import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsGateway } from './entities/sms-gateway.entity';

const DEFAULT_GATEWAYS = [
  { name: 'Twilio', slug: 'twilio' },
  { name: 'Nexmo', slug: 'nexmo' },
  { name: 'Msg91', slug: 'msg91' },
  { name: 'Clickatell', slug: 'clickatell' },
  { name: 'BulkSMS', slug: 'bulksms' },
  { name: 'Telesign', slug: 'telesign' },
];

@Injectable()
export class SmsGatewaysService {
  constructor(@InjectRepository(SmsGateway) private repo: Repository<SmsGateway>) {}

  async onModuleInit() {
    for (const gw of DEFAULT_GATEWAYS) {
      const exists = await this.repo.findOne({ where: { slug: gw.slug } });
      if (!exists) await this.repo.save(this.repo.create(gw));
    }
  }

  findAll() { return this.repo.find({ order: { name: 'ASC' } }); }

  async findOne(slug: string) {
    const gw = await this.repo.findOne({ where: { slug } });
    if (!gw) throw new NotFoundException('SMS gateway not found');
    return gw;
  }

  async update(slug: string, dto: { isActive?: boolean; config?: Record<string, string> }) {
    const gw = await this.findOne(slug);
    await this.repo.update(gw.id, dto);
    return this.findOne(slug);
  }
}
