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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemCategory = void 0;
const typeorm_1 = require("typeorm");
const branch_entity_1 = require("../../../branches/entities/branch.entity");
let ItemCategory = class ItemCategory {
};
exports.ItemCategory = ItemCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ItemCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ItemCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ItemCategory.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ItemCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ItemCategory.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ItemCategory.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ItemCategory.prototype, "parentCategoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ItemCategory, (cat) => cat.children, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parentCategoryId' }),
    __metadata("design:type", ItemCategory)
], ItemCategory.prototype, "parentCategory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ItemCategory, (cat) => cat.parentCategory),
    __metadata("design:type", Array)
], ItemCategory.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ItemCategory.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'branchId' }),
    __metadata("design:type", branch_entity_1.Branch)
], ItemCategory.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ItemCategory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ItemCategory.prototype, "variationOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ItemCategory.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ItemCategory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ItemCategory.prototype, "updatedAt", void 0);
exports.ItemCategory = ItemCategory = __decorate([
    (0, typeorm_1.Entity)('item_categories')
], ItemCategory);
//# sourceMappingURL=item-category.entity.js.map