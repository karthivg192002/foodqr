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
exports.DiningTablesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const dining_tables_service_1 = require("./dining-tables.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
let DiningTablesController = class DiningTablesController {
    constructor(diningTablesService, configService) {
        this.diningTablesService = diningTablesService;
        this.configService = configService;
    }
    findAll(branchId) {
        return this.diningTablesService.findAll(branchId);
    }
    findBySlug(slug) {
        return this.diningTablesService.findBySlug(slug);
    }
    findAllAdmin(branchId) {
        return this.diningTablesService.findAll(branchId);
    }
    create(dto) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
        return this.diningTablesService.create(dto, frontendUrl);
    }
    update(id, dto) {
        return this.diningTablesService.update(id, dto);
    }
    regenerateQr(id) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
        return this.diningTablesService.regenerateQr(id, frontendUrl);
    }
    updateStatus(id, status) {
        return this.diningTablesService.updateStatus(id, status);
    }
    remove(id) {
        return this.diningTablesService.remove(id);
    }
    regenerateToken(id) {
        return this.diningTablesService.regenerateToken(id);
    }
    assignWaiter(id, waiterId) {
        return this.diningTablesService.update(id, { waiterId });
    }
    async exportExcel(branchId, res) {
        return this.diningTablesService.exportExcel(branchId, res);
    }
};
exports.DiningTablesController = DiningTablesController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/dining-tables'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "findAll", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/dining-tables/slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.WAITER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/dining-tables'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/dining-tables'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dining_tables_service_1.CreateDiningTableDto]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/dining-tables/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/dining-tables/:id/regenerate-qr'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "regenerateQr", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.WAITER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/dining-tables/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('admin/dining-tables/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/dining-tables/:id/regenerate-token'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "regenerateToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/dining-tables/:id/waiter'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('waiterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiningTablesController.prototype, "assignWaiter", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/dining-tables/export/excel'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiningTablesController.prototype, "exportExcel", null);
exports.DiningTablesController = DiningTablesController = __decorate([
    (0, swagger_1.ApiTags)('Dining Tables'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dining_tables_service_1.DiningTablesService,
        config_1.ConfigService])
], DiningTablesController);
//# sourceMappingURL=dining-tables.controller.js.map