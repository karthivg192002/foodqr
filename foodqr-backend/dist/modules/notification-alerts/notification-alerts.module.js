"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAlertsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_alert_entity_1 = require("./entities/notification-alert.entity");
const notification_alerts_service_1 = require("./notification-alerts.service");
const notification_alerts_controller_1 = require("./notification-alerts.controller");
let NotificationAlertsModule = class NotificationAlertsModule {
};
exports.NotificationAlertsModule = NotificationAlertsModule;
exports.NotificationAlertsModule = NotificationAlertsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([notification_alert_entity_1.NotificationAlert])],
        providers: [notification_alerts_service_1.NotificationAlertsService],
        controllers: [notification_alerts_controller_1.NotificationAlertsController],
        exports: [notification_alerts_service_1.NotificationAlertsService],
    })
], NotificationAlertsModule);
//# sourceMappingURL=notification-alerts.module.js.map