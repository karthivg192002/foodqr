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
exports.OssService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const enums_1 = require("../../common/enums");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let OssService = class OssService {
    constructor(orderRepo, connections) {
        this.orderRepo = orderRepo;
        this.orderRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, order_entity_1.Order, orderRepo);
    }
    async getOssOrders(branchId) {
        const qb = this.orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.diningTable', 'diningTable')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.status IN (:...statuses)', {
            statuses: [enums_1.OrderStatus.PENDING, enums_1.OrderStatus.ACCEPTED, enums_1.OrderStatus.PREPARING, enums_1.OrderStatus.PREPARED],
        })
            .orderBy('order.createdAt', 'DESC')
            .take(50);
        if (branchId)
            qb.andWhere('order.branchId = :branchId', { branchId });
        return qb.getMany();
    }
};
exports.OssService = OssService;
exports.OssService = OssService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], OssService);
//# sourceMappingURL=oss.service.js.map