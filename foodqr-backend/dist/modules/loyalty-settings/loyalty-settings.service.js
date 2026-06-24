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
exports.LoyaltySettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const loyalty_setting_entity_1 = require("./entities/loyalty-setting.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let LoyaltySettingsService = class LoyaltySettingsService {
    constructor(repo, connections) {
        this.repo = repo;
        this.repo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, loyalty_setting_entity_1.LoyaltySetting, repo);
    }
    findAll() { return this.repo.find(); }
    async get(key) {
        const row = await this.repo.findOne({ where: { key } });
        return row ? row.value : null;
    }
    async set(key, value) {
        const existing = await this.repo.findOne({ where: { key } });
        if (existing) {
            await this.repo.update(existing.id, { value });
            return this.repo.findOne({ where: { key } });
        }
        return this.repo.save(this.repo.create({ key, value }));
    }
    async bulkSet(settings) {
        return Promise.all(settings.map((s) => this.set(s.key, s.value)));
    }
    async getThresholds() {
        const keys = ['high_value_threshold', 'frequent_order_threshold', 'inactive_days'];
        const rows = await this.repo.find({ where: keys.map((k) => ({ key: k })) });
        return rows.reduce((acc, r) => ({ ...acc, [r.key]: Number(r.value) }), {});
    }
};
exports.LoyaltySettingsService = LoyaltySettingsService;
exports.LoyaltySettingsService = LoyaltySettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loyalty_setting_entity_1.LoyaltySetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], LoyaltySettingsService);
//# sourceMappingURL=loyalty-settings.service.js.map