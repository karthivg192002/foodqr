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
exports.KdsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const kds_service_1 = require("./kds.service");
const events_service_1 = require("../events/events.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
let KdsController = class KdsController {
    constructor(kdsService, eventsService) {
        this.kdsService = kdsService;
        this.eventsService = eventsService;
    }
    getOrders(branchId) {
        return this.kdsService.getKdsOrders(branchId);
    }
    updateStatus(id, status) {
        return this.kdsService.updateStatus(id, status);
    }
    stream(branchId) {
        return this.eventsService.stream(branchId).pipe((0, operators_1.map)((event) => ({ data: JSON.stringify(event) })));
    }
};
exports.KdsController = KdsController;
__decorate([
    (0, common_1.Get)('orders'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.CHEF, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.CHEF, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Sse)('stream'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.CHEF, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], KdsController.prototype, "stream", null);
exports.KdsController = KdsController = __decorate([
    (0, swagger_1.ApiTags)('KDS - Kitchen Display'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/kds'),
    __metadata("design:paramtypes", [kds_service_1.KdsService,
        events_service_1.EventsService])
], KdsController);
//# sourceMappingURL=kds.controller.js.map