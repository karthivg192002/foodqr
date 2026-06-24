import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(AppSetting) private settingRepo: Repository<AppSetting>,
    connections: TenantConnectionService,
  ) {
    this.settingRepo = tenantAwareRepo(connections, AppSetting, settingRepo);
  }

  private async getSetting(key: string) {
    const s = await this.settingRepo.findOne({ where: { key } });
    return s?.value;
  }

  private async setSetting(key: string, value: string) {
    const existing = await this.settingRepo.findOne({ where: { key } });
    if (existing) {
      await this.settingRepo.update(existing.id, { value });
    } else {
      await this.settingRepo.save(this.settingRepo.create({ key, value, group: 'license' }));
    }
  }

  async getLicenseInfo() {
    const [licenseKey, licenseStatus, licenseEmail, licensedFor, expiresAt] = await Promise.all([
      this.getSetting('license_key'),
      this.getSetting('license_status'),
      this.getSetting('license_email'),
      this.getSetting('license_domain'),
      this.getSetting('license_expires_at'),
    ]);

    return {
      licenseKey: licenseKey ? `${licenseKey.substring(0, 8)}****` : null,
      status: licenseStatus || 'inactive',
      email: licenseEmail,
      licensedFor,
      expiresAt,
      isActive: licenseStatus === 'active',
    };
  }

  async activateLicense(licenseKey: string, email: string) {
    if (!licenseKey || licenseKey.length < 10) {
      throw new BadRequestException('Invalid license key format');
    }

    // Validate key format (XXXX-XXXX-XXXX-XXXX or similar)
    const isValidFormat = /^[A-Z0-9]{4,}-[A-Z0-9]{4,}-[A-Z0-9]{4,}/.test(licenseKey.toUpperCase());
    if (!isValidFormat) {
      throw new BadRequestException('License key must be in format XXXX-XXXX-XXXX');
    }

    await Promise.all([
      this.setSetting('license_key', licenseKey),
      this.setSetting('license_email', email),
      this.setSetting('license_status', 'active'),
      this.setSetting('license_activated_at', new Date().toISOString()),
    ]);

    return { message: 'License activated successfully', status: 'active' };
  }

  async deactivateLicense() {
    await this.setSetting('license_status', 'inactive');
    return { message: 'License deactivated' };
  }

  async checkLicense() {
    const status = await this.getSetting('license_status');
    return { isValid: status === 'active', status: status || 'inactive' };
  }
}
