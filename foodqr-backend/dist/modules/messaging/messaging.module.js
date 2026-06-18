"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const message_entity_1 = require("./entities/message.entity");
const message_history_entity_1 = require("./entities/message-history.entity");
const messaging_service_1 = require("./messaging.service");
const messaging_controller_1 = require("./messaging.controller");
const chatbot_service_1 = require("./chatbot.service");
const order_entity_1 = require("../orders/entities/order.entity");
const loyalty_stamp_entity_1 = require("../loyalty/entities/loyalty-stamp.entity");
const loyalty_program_entity_1 = require("../loyalty/entities/loyalty-program.entity");
const loyalty_reward_entity_1 = require("../loyalty/entities/loyalty-reward.entity");
const item_entity_1 = require("../menu/items/entities/item.entity");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message, message_history_entity_1.MessageHistory, order_entity_1.Order, loyalty_stamp_entity_1.LoyaltyStamp, loyalty_program_entity_1.LoyaltyProgram, loyalty_reward_entity_1.LoyaltyReward, item_entity_1.Item])],
        providers: [messaging_service_1.MessagingService, chatbot_service_1.ChatbotService],
        controllers: [messaging_controller_1.MessagingController],
        exports: [messaging_service_1.MessagingService],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map