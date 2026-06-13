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
exports.LoyaltySettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
const loyalty_settings_service_1 = require("./loyalty-settings.service");
let LoyaltySettingsController = class LoyaltySettingsController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        const rows = await this.service.findAll();
        return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
    }
    getThresholds() { return this.service.getThresholds(); }
    async bulkSet(body) {
        const entries = Object.entries(body.settings).map(([key, value]) => ({ key, value }));
        return this.service.bulkSet(entries);
    }
};
exports.LoyaltySettingsController = LoyaltySettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltySettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('thresholds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoyaltySettingsController.prototype, "getThresholds", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoyaltySettingsController.prototype, "bulkSet", null);
exports.LoyaltySettingsController = LoyaltySettingsController = __decorate([
    (0, swagger_1.ApiTags)('Loyalty Settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, common_1.Controller)('admin/loyalty-settings'),
    __metadata("design:paramtypes", [loyalty_settings_service_1.LoyaltySettingsService])
], LoyaltySettingsController);
//# sourceMappingURL=loyalty-settings.controller.js.map