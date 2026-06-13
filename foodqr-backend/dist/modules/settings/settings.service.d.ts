import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';
export declare class SettingsService {
    private settingRepo;
    constructor(settingRepo: Repository<AppSetting>);
    getAll(group?: string): Promise<{}>;
    get(key: string): Promise<string>;
    set(key: string, value: string, group?: string): Promise<{
        key: string;
        value: string;
    }>;
    setMany(settings: Record<string, string>, group?: string): Promise<{}>;
    getCompanySettings(): Promise<{}>;
    getSiteSettings(): Promise<{}>;
    getMailSettings(): Promise<{}>;
    getPaymentSettings(): Promise<{}>;
    getSmsSettings(): Promise<{}>;
    getBusinessSettings(): Promise<{}>;
    getOrderSettings(): Promise<{}>;
    getNotificationSettings(): Promise<{}>;
    getPublicSettings(): Promise<{}>;
}
