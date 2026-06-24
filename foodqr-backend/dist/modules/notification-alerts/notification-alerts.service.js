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
exports.NotificationAlertsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_alert_entity_1 = require("./entities/notification-alert.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let NotificationAlertsService = class NotificationAlertsService {
    constructor(repo, connections) {
        this.repo = repo;
        this.repo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, notification_alert_entity_1.NotificationAlert, repo);
    }
    findAll() { return this.repo.find(); }
    async findOne(id) {
        const alert = await this.repo.findOne({ where: { id } });
        if (!alert)
            throw new common_1.NotFoundException('Notification alert not found');
        return alert;
    }
    create(dto) { return this.repo.save(this.repo.create(dto)); }
    async update(id, dto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async findByLanguage(language) {
        return this.repo.findOne({ where: { language } });
    }
};
exports.NotificationAlertsService = NotificationAlertsService;
exports.NotificationAlertsService = NotificationAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_alert_entity_1.NotificationAlert)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], NotificationAlertsService);
//# sourceMappingURL=notification-alerts.service.js.map