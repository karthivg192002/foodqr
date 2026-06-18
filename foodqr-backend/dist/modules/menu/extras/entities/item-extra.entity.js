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
exports.ItemExtra = void 0;
const typeorm_1 = require("typeorm");
const item_entity_1 = require("../../items/entities/item.entity");
let ItemExtra = class ItemExtra {
};
exports.ItemExtra = ItemExtra;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ItemExtra.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ItemExtra.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", item_entity_1.Item)
], ItemExtra.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ItemExtra.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ItemExtra.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: null }),
    __metadata("design:type", Number)
], ItemExtra.prototype, "maxQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ItemExtra.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ItemExtra.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ItemExtra.prototype, "createdAt", void 0);
exports.ItemExtra = ItemExtra = __decorate([
    (0, typeorm_1.Entity)('item_extras')
], ItemExtra);
//# sourceMappingURL=item-extra.entity.js.map