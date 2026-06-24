import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as https from 'https';
import * as querystring from 'querystring';
import { SmsGateway } from './entities/sms-gateway.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

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
  private readonly logger = new Logger(SmsGatewaysService.name);

  constructor(
    @InjectRepository(SmsGateway) private repo: Repository<SmsGateway>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, SmsGateway, repo);
  }

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

  /** Send an SMS via the active gateway. Returns true on success, false on failure. */
  async send(to: string, message: string): Promise<boolean> {
    const active = await this.repo.findOne({ where: { isActive: true } });
    if (!active) {
      this.logger.warn('No active SMS gateway configured');
      return false;
    }
    try {
      switch (active.slug) {
        case 'twilio':
          return await this.sendViaTwilio(to, message, active.config);
        default:
          this.logger.warn(`SMS gateway "${active.slug}" has no send implementation`);
          return false;
      }
    } catch (e) {
      this.logger.error(`SMS send failed via ${active.slug}: ${e.message}`);
      return false;
    }
  }

  private sendViaTwilio(to: string, body: string, config: Record<string, string>): Promise<boolean> {
    const { accountSid, authToken, fromNumber } = config || {};
    if (!accountSid || !authToken || !fromNumber) {
      this.logger.warn('Twilio config incomplete (accountSid, authToken, fromNumber required)');
      return Promise.resolve(false);
    }

    const postData = querystring.stringify({ To: to, From: fromNumber, Body: body });
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: 'api.twilio.com',
          path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (res) => {
          res.on('data', () => null);
          res.on('end', () => resolve(res.statusCode >= 200 && res.statusCode < 300));
        },
      );
      req.on('error', (e) => { this.logger.error('Twilio HTTP error: ' + e.message); resolve(false); });
      req.write(postData);
      req.end();
    });
  }
}
