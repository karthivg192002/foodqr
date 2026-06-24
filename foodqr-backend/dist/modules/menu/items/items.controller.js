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
exports.ItemsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const items_service_1 = require("./items.service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const decorators_1 = require("../../../common/decorators");
const enums_1 = require("../../../common/enums");
let ItemsController = class ItemsController {
    constructor(itemsService) {
        this.itemsService = itemsService;
    }
    findAll(search, categoryId, page, limit, branchId) {
        return this.itemsService.findAll(search, categoryId, undefined, page, limit, branchId);
    }
    getFeatured() { return this.itemsService.getFeatured(); }
    getPopular() { return this.itemsService.getPopular(); }
    findOne(id) { return this.itemsService.findOne(id); }
    findAllAdmin(search, categoryId, page, limit, branchId) {
        return this.itemsService.findAllAdmin(search, categoryId, page, limit, branchId);
    }
    create(dto) { return this.itemsService.create(dto); }
    update(id, dto) {
        return this.itemsService.update(id, dto);
    }
    toggleStatus(id) { return this.itemsService.toggleStatus(id); }
    toggleFeatured(id) { return this.itemsService.toggleFeatured(id); }
    remove(id) { return this.itemsService.remove(id); }
    restore(id) { return this.itemsService.restore(id); }
    findArchived(search, categoryId, page, limit) {
        return this.itemsService.findAllWithDeleted(search, categoryId, page, limit);
    }
    async exportExcel(res) {
        return this.itemsService.exportExcel(res);
    }
    downloadSample(res) {
        const csv = ['name,description,price,categoryId,itemType,caution,ingredients,calories,protein,carbs,fat,taxRate,isFeatured,status',
            '"Sample Burger","Juicy beef burger",12.99,,non_veg,"Contains allergens","Beef, Lettuce, Tomato",450,30,35,18,5,false,true',
        ].join('\n');
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="items-import-sample.csv"' });
        res.send(csv);
    }
    async importCsv(file) {
        return this.itemsService.importFromCsv(file.buffer.toString('utf-8'));
    }
};
exports.ItemsController = ItemsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/items'),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'branchId', required: false }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "findAll", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/items/featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "getFeatured", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/items/popular'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "getPopular", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/items/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/items'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [items_service_1.CreateItemDto]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/items/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/items/:id/toggle-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/items/:id/toggle-featured'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "toggleFeatured", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('admin/items/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/items/:id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "restore", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/items/archived'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "findArchived", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/items/export/excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/items/export/sample'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "downloadSample", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/items/import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "importCsv", null);
exports.ItemsController = ItemsController = __decorate([
    (0, swagger_1.ApiTags)('Menu - Items'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [items_service_1.ItemsService])
], ItemsController);
//# sourceMappingURL=items.controller.js.map