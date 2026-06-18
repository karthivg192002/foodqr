"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemAttributesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const item_attribute_entity_1 = require("./entities/item-attribute.entity");
const item_category_attribute_entity_1 = require("./entities/item-category-attribute.entity");
const item_variation_entity_1 = require("../menu/variations/entities/item-variation.entity");
const item_attributes_service_1 = require("./item-attributes.service");
const item_attributes_controller_1 = require("./item-attributes.controller");
let ItemAttributesModule = class ItemAttributesModule {
};
exports.ItemAttributesModule = ItemAttributesModule;
exports.ItemAttributesModule = ItemAttributesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([item_attribute_entity_1.ItemAttribute, item_category_attribute_entity_1.ItemCategoryAttribute, item_variation_entity_1.ItemVariation])],
        providers: [item_attributes_service_1.ItemAttributesService],
        controllers: [item_attributes_controller_1.ItemAttributesController],
        exports: [item_attributes_service_1.ItemAttributesService],
    })
], ItemAttributesModule);
//# sourceMappingURL=item-attributes.module.js.map