import { Repository } from 'typeorm';
import { LoyaltySetting } from './entities/loyalty-setting.entity';
export declare class LoyaltySettingsService {
    private repo;
    constructor(repo: Repository<LoyaltySetting>);
    findAll(): Promise<LoyaltySetting[]>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<LoyaltySetting>;
    bulkSet(settings: {
        key: string;
        value: string;
    }[]): Promise<LoyaltySetting[]>;
    getThresholds(): Promise<Record<string, number>>;
}
