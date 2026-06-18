import { SettingsService } from './settings.service';
import { UploadService } from '../upload/upload.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly uploadService;
    constructor(settingsService: SettingsService, uploadService: UploadService);
    getAll(group?: string): Promise<{}>;
    getCompany(): Promise<{}>;
    setCompany(settings: Record<string, string>): Promise<{}>;
    getSite(): Promise<{}>;
    setSite(settings: Record<string, string>): Promise<{}>;
    getMail(): Promise<{}>;
    setMail(settings: Record<string, string>): Promise<{}>;
    getPayment(): Promise<{}>;
    setPayment(settings: Record<string, string>): Promise<{}>;
    getSms(): Promise<{}>;
    setSms(settings: Record<string, string>): Promise<{}>;
    getBusiness(): Promise<{}>;
    setBusiness(settings: Record<string, string>): Promise<{}>;
    getOrder(): Promise<{}>;
    setOrder(settings: Record<string, string>): Promise<{}>;
    getNotification(): Promise<{}>;
    setNotification(settings: Record<string, string>): Promise<{}>;
    getOrderSetup(): Promise<{}>;
    setOrderSetup(settings: Record<string, string>): Promise<{}>;
    getSocialMedia(): Promise<{}>;
    setSocialMedia(settings: Record<string, string>): Promise<{}>;
    getTheme(): Promise<{}>;
    setTheme(settings: Record<string, string>): Promise<{}>;
    getOtp(): Promise<{}>;
    setOtp(settings: Record<string, string>): Promise<{}>;
    getFirebase(): Promise<{}>;
    setFirebase(settings: Record<string, string>): Promise<{}>;
    uploadLogo(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadFavicon(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    getPublic(): Promise<{}>;
}
