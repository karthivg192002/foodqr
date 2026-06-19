"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_setting_entity_1 = require("./entities/app-setting.entity");
let SettingsService = class SettingsService {
    constructor(settingRepo) {
        this.settingRepo = settingRepo;
    }
    async getAll(group) {
        const where = {};
        if (group)
            where.group = group;
        const settings = await this.settingRepo.find({ where });
        return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    }
    async get(key) {
        const setting = await this.settingRepo.findOne({ where: { key } });
        return setting?.value || null;
    }
    async set(key, value, group) {
        const existing = await this.settingRepo.findOne({ where: { key } });
        if (existing) {
            await this.settingRepo.update(existing.id, { value });
        }
        else {
            await this.settingRepo.save(this.settingRepo.create({ key, value, group }));
        }
        return { key, value };
    }
    async setMany(settings, group) {
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(app_setting_entity_1.AppSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map