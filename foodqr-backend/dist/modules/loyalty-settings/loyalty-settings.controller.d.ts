import { LoyaltySettingsService } from './loyalty-settings.service';
export declare class LoyaltySettingsController {
    private readonly service;
    constructor(service: LoyaltySettingsService);
    findAll(): Promise<any>;
    getThresholds(): Promise<Record<string, number>>;
    bulkSet(body: {
        settings: Record<string, string>;
    }): Promise<import("./entities/loyalty-setting.entity").LoyaltySetting[]>;
}
