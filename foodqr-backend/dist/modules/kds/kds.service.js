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
exports.KdsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const enums_1 = require("../../common/enums");
let KdsService = class KdsService {
    constructor(orderRepo) {
        this.orderRepo = orderRepo;
    }
    async getKdsOrders(branchId) {
        const qb = this.orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.item', 'item')
            .leftJoinAndSelect('order.diningTable', 'diningTable')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.status IN (:...statuses)', {
            statuses: [enums_1.OrderStatus.PENDING, enums_1.OrderStatus.ACCEPTED, enums_1.OrderStatus.PREPARING],
        })
            .orderBy('order.createdAt', 'ASC');
        if (branchId)
            qb.andWhere('order.branchId = :branchId', { branchId });
        return qb.getMany();
    }
    async updateStatus(orderId, status) {
        await this.orderRepo.update(orderId, { status });
        return this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['items', 'items.item', 'diningTable'],
        });
    }
};
exports.KdsService = KdsService;
exports.KdsService = KdsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KdsService);
//# sourceMappingURL=kds.service.js.map