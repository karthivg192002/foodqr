"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsGatewaysModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sms_gateway_entity_1 = require("./entities/sms-gateway.entity");
const sms_gateways_service_1 = require("./sms-gateways.service");
const sms_gateways_controller_1 = require("./sms-gateways.controller");
let SmsGatewaysModule = class SmsGatewaysModule {
};
exports.SmsGatewaysModule = SmsGatewaysModule;
exports.SmsGatewaysModule = SmsGatewaysModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([sms_gateway_entity_1.SmsGateway])],
        providers: [sms_gateways_service_1.SmsGatewaysService],
        controllers: [sms_gateways_controller_1.SmsGatewaysController],
        exports: [sms_gateways_service_1.SmsGatewaysService],
    })
], SmsGatewaysModule);
//# sourceMappingURL=sms-gateways.module.js.map