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
exports.PushNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const push_notification_entity_1 = require("./entities/push-notification.entity");
let PushNotificationsService = class PushNotificationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async send(dto) {
        const log = this.repo.create({
            userId: dto.userId,
            title: dto.title,
            body: dto.body,
            data: dto.data,
            target: dto.target || 'user',
            targetRole: dto.targetRole,
            status: 'sent',
        });
        return this.repo.save(log);
    }
    findAll(filters = {}) {
        const { page = 1, limit = 20, userId, status } = filters;
        const qb = this.repo.createQueryBuilder('pn')
            .leftJoinAndSelect('pn.user', 'user')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('pn.createdAt', 'DESC');
        if (userId)
            qb.andWhere('pn.userId = :userId', { userId });
        if (status)
            qb.andWhere('pn.status = :status', { status });
        return qb.getManyAndCount().then(([data, total]) => ({
            data, total, page, limit, pages: Math.ceil(total / limit),
        }));
    }
};
exports.PushNotificationsService = PushNotificationsService;
exports.PushNotificationsService = PushNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(push_notification_entity_1.PushNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PushNotificationsService);
//# sourceMappingURL=push-notifications.service.js.map