import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltySetting } from './entities/loyalty-setting.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class LoyaltySettingsService {
  constructor(
    @InjectRepository(LoyaltySetting) private repo: Repository<LoyaltySetting>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, LoyaltySetting, repo);
  }

  findAll() { return this.repo.find(); }

  async get(key: string): Promise<string | null> {
    const row = await this.repo.findOne({ where: { key } });
    return row ? row.value : null;
  }

  async set(key: string, value: string) {
    const existing = await this.repo.findOne({ where: { key } });
    if (existing) {
      await this.repo.update(existing.id, { value });
      return this.repo.findOne({ where: { key } });
    }
    return this.repo.save(this.repo.create({ key, value }));
  }

  async bulkSet(settings: { key: string; value: string }[]) {
    return Promise.all(settings.map((s) => this.set(s.key, s.value)));
  }

  async getThresholds() {
    const keys = ['high_value_threshold', 'frequent_order_threshold', 'inactive_days'];
    const rows = await this.repo.find({ where: keys.map((k) => ({ key: k })) as any });
    return rows.reduce((acc, r) => ({ ...acc, [r.key]: Number(r.value) }), {} as Record<string, number>);
  }
}
