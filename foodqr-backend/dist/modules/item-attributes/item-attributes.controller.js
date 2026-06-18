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
exports.ItemAttributesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const item_attributes_service_1 = require("./item-attributes.service");
let ItemAttributesController = class ItemAttributesController {
    constructor(service) {
        this.service = service;
    }
    findAll() { return this.service.findAll(); }
    listGroupByAttribute(itemId) {
        return this.service.listGroupByAttribute(itemId);
    }
    getByCategory(categoryId) {
        return this.service.getByCategory(categoryId);
    }
    assignToCategory(categoryId, body) {
        return this.service.assignToCategory(categoryId, body.attributeIds);
    }
    assignToCategoryFlat(body) {
        return this.service.assignToCategory(body.categoryId, [body.attributeId]);
    }
    findOne(id) { return this.service.findOne(id); }
    create(body) { return this.service.create(body); }
    update(id, body) {
        return this.service.update(id, body);
    }
    remove(id) { return this.service.remove(id); }
};
exports.ItemAttributesController = ItemAttributesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('items/:itemId/group-by-attribute'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "listGroupByAttribute", null);
__decorate([
    (0, common_1.Get)('category/:categoryId'),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Post)('category/:categoryId/assign'),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "assignToCategory", null);
__decorate([
    (0, common_1.Post)('assign-to-category'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "assignToCategoryFlat", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemAttributesController.prototype, "remove", null);
exports.ItemAttributesController = ItemAttributesController = __decorate([
    (0, swagger_1.ApiTags)('Item Attributes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/item-attributes'),
    __metadata("design:paramtypes", [item_attributes_service_1.ItemAttributesService])
], ItemAttributesController);
//# sourceMappingURL=item-attributes.controller.js.map