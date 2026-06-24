import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting) private settingRepo: Repository<AppSetting>,
    connections: TenantConnectionService,
  ) {
    this.settingRepo = tenantAwareRepo(connections, AppSetting, settingRepo);
  }

  async getAll(group?: string) {
    const where: any = {};
    if (group) where.group = group;
    const settings = await this.settingRepo.find({ where });
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async get(key: string): Promise<string> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    return setting?.value || null;
  }

  async set(key: string, value: string, group?: string) {
    const existing = await this.settingRepo.findOne({ where: { key } });
    if (existing) {
      await this.settingRepo.update(existing.id, { value });
    } else {
      await this.settingRepo.save(this.settingRepo.create({ key, value, group }));
    }
    return { key, value };
  }

  async setMany(settings: Record<string, string>, group?: string) {
    const promises = Object.entries(settings).map(([key, value]) => this.set(key, value, group));
    await Promise.all(promises);
    return this.getAll(group);
  }

  async getCompanySettings() { return this.getAll('company'); }
  async getSiteSettings() { return this.getAll('site'); }
  async getMailSettings() { return this.getAll('mail'); }
  async getPaymentSettings() { return this.getAll('payment'); }
  async getSmsSettings() { return this.getAll('sms'); }
  async getBusinessSettings() { return this.getAll('business'); }
  async getOrderSettings() { return this.getAll('order'); }
  async getNotificationSettings() { return this.getAll('notification'); }

  async getPublicSettings() {
    const keys = [
      'business_name', 'logo', 'currency_symbol', 'timezone',
      'enable_delivery', 'enable_takeaway', 'enable_dining_table',
      'enable_pos', 'enable_loyalty',
      'primary_color', 'secondary_color', 'font_family', 'favicon',
      'product_name', 'footer_credit',
    ];
    const settings = await this.settingRepo.find();
    return settings
      .filter((s) => keys.includes(s.key))
      .reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }
}
