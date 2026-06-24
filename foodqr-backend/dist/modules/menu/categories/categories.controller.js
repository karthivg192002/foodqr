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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const categories_service_1 = require("./categories.service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const decorators_1 = require("../../../common/decorators");
const enums_1 = require("../../../common/enums");
let CategoriesController = class CategoriesController {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    findAll(branchId) { return this.categoriesService.findAll(true, branchId); }
    findOne(id) { return this.categoriesService.findOne(id); }
    findAllAdmin(branchId) { return this.categoriesService.findAllFlat(branchId); }
    create(dto) { return this.categoriesService.create(dto); }
    update(id, dto) {
        return this.categoriesService.update(id, dto);
    }
    getPosCategories() { return this.categoriesService.findAll(true); }
    getPosSubCategories(id) {
        return this.categoriesService.findOne(id).then((cat) => cat.children || []);
    }
    updateSortOrder(items) {
        return this.categoriesService.updateSortOrder(items);
    }
    remove(id) { return this.categoriesService.remove(id); }
    async exportExcel(res) {
        return this.categoriesService.exportExcel(res);
    }
    downloadSample(res) {
        const csv = ['name,description,parentCategoryId,status,variationOnly',
            '"Burgers","All burger options",,true,false',
            '"Veggie Burgers","Plant-based burgers",,true,false',
        ].join('\n');
        res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="categories-import-sample.csv"' });
        res.send(csv);
    }
    async importCsv(file) {
        return this.categoriesService.importFromCsv(file.buffer.toString('utf-8'));
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/categories'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/categories'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [categories_service_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.POS_OPERATOR, enums_1.UserRole.STAFF),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/pos/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getPosCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER, enums_1.UserRole.POS_OPERATOR, enums_1.UserRole.STAFF),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/pos/categories/:id/sub-categories'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getPosSubCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/categories/sort-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "updateSortOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('admin/categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/categories/export/excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/categories/export/sample'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "downloadSample", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('admin/categories/import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "importCsv", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Menu - Categories'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map