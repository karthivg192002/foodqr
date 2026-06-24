"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const offer_entity_1 = require("./entities/offer.entity");
const banner_entity_1 = require("./entities/banner.entity");
const promotion_banner_entity_1 = require("./entities/promotion-banner.entity");
const offer_item_entity_1 = require("./entities/offer-item.entity");
const offers_controller_1 = require("./offers.controller");
const offers_service_1 = require("./offers.service");
const tenants_module_1 = require("../tenants/tenants.module");
let OffersModule = class OffersModule {
};
exports.OffersModule = OffersModule;
exports.OffersModule = OffersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([offer_entity_1.Offer, banner_entity_1.Banner, promotion_banner_entity_1.PromotionBanner, offer_item_entity_1.OfferItem]), tenants_module_1.TenantsModule],
        controllers: [offers_controller_1.OffersController],
        providers: [offers_service_1.OffersService],
        exports: [offers_service_1.OffersService, typeorm_1.TypeOrmModule],
    })
], OffersModule);
//# sourceMappingURL=offers.module.js.map