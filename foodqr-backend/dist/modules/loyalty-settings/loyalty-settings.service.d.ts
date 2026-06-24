import { Repository } from 'typeorm';
import { LoyaltySetting } from './entities/loyalty-setting.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class LoyaltySettingsService {
    private repo;
    constructor(repo: Repository<LoyaltySetting>, connections: TenantConnectionService);
    findAll(): Promise<LoyaltySetting[]>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<LoyaltySetting>;
    bulkSet(settings: {
        key: string;
        value: string;
    }[]): Promise<LoyaltySetting[]>;
    getThresholds(): Promise<Record<string, number>>;
}
