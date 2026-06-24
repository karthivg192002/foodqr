"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemAddonsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const item_addon_entity_1 = require("./entities/item-addon.entity");
const item_entity_1 = require("../menu/items/entities/item.entity");
const item_addons_service_1 = require("./item-addons.service");
const item_addons_controller_1 = require("./item-addons.controller");
const tenants_module_1 = require("../tenants/tenants.module");
let ItemAddonsModule = class ItemAddonsModule {
};
exports.ItemAddonsModule = ItemAddonsModule;
exports.ItemAddonsModule = ItemAddonsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([item_addon_entity_1.ItemAddon, item_entity_1.Item]), tenants_module_1.TenantsModule],
        providers: [item_addons_service_1.ItemAddonsService],
        controllers: [item_addons_controller_1.ItemAddonsController],
        exports: [item_addons_service_1.ItemAddonsService],
    })
], ItemAddonsModule);
//# sourceMappingURL=item-addons.module.js.map