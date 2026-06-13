"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltySettingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const loyalty_setting_entity_1 = require("./entities/loyalty-setting.entity");
const loyalty_settings_service_1 = require("./loyalty-settings.service");
const loyalty_settings_controller_1 = require("./loyalty-settings.controller");
let LoyaltySettingsModule = class LoyaltySettingsModule {
};
exports.LoyaltySettingsModule = LoyaltySettingsModule;
exports.LoyaltySettingsModule = LoyaltySettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([loyalty_setting_entity_1.LoyaltySetting])],
        providers: [loyalty_settings_service_1.LoyaltySettingsService],
        controllers: [loyalty_settings_controller_1.LoyaltySettingsController],
        exports: [loyalty_settings_service_1.LoyaltySettingsService],
    })
], LoyaltySettingsModule);
//# sourceMappingURL=loyalty-settings.module.js.map