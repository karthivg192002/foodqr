"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_address_entity_1 = require("./entities/order-address.entity");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const user_entity_1 = require("../users/entities/user.entity");
const item_entity_1 = require("../menu/items/entities/item.entity");
const item_variation_entity_1 = require("../menu/variations/entities/item-variation.entity");
const loyalty_stamp_entity_1 = require("../loyalty/entities/loyalty-stamp.entity");
const offer_entity_1 = require("../offers/entities/offer.entity");
const offer_item_entity_1 = require("../offers/entities/offer-item.entity");
const app_setting_entity_1 = require("../settings/entities/app-setting.entity");
const time_slots_module_1 = require("../time-slots/time-slots.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, order_item_entity_1.OrderItem, order_address_entity_1.OrderAddress, user_entity_1.User, item_entity_1.Item, item_variation_entity_1.ItemVariation, loyalty_stamp_entity_1.LoyaltyStamp, offer_entity_1.Offer, offer_item_entity_1.OfferItem, app_setting_entity_1.AppSetting]),
            time_slots_module_1.TimeSlotsModule,
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
        exports: [orders_service_1.OrdersService, typeorm_1.TypeOrmModule],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map