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
exports.LoyaltyConfiguration = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../../../common/enums");
const loyalty_program_entity_1 = require("./loyalty-program.entity");
let LoyaltyConfiguration = class LoyaltyConfiguration {
};
exports.LoyaltyConfiguration = LoyaltyConfiguration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoyaltyConfiguration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LoyaltyConfiguration.prototype, "loyaltyProgramId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loyalty_program_entity_1.LoyaltyProgram, (p) => p.configurations),
    (0, typeorm_1.JoinColumn)({ name: 'loyaltyProgramId' }),
    __metadata("design:type", loyalty_program_entity_1.LoyaltyProgram)
], LoyaltyConfiguration.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoyaltyConfiguration.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.LoyaltyStampCalculationType, default: enums_1.LoyaltyStampCalculationType.FIXED_PER_ORDER }),
    __metadata("design:type", String)
], LoyaltyConfiguration.prototype, "calculationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LoyaltyConfiguration.prototype, "thresholdValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], LoyaltyConfiguration.prototype, "stampsPerThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.LoyaltyRewardType, default: enums_1.LoyaltyRewardType.DISCOUNT }),
    __metadata("design:type", String)
], LoyaltyConfiguration.prototype, "rewardType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LoyaltyConfiguration.prototype, "rewardValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.LoyaltyPeriodType, default: enums_1.LoyaltyPeriodType.LIFETIME }),
    __metadata("design:type", String)
], LoyaltyConfiguration.prototype, "periodType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LoyaltyConfiguration.prototype, "periodLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LoyaltyConfiguration.prototype, "maxStampsPerPeriod", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LoyaltyConfiguration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LoyaltyConfiguration.prototype, "updatedAt", void 0);
exports.LoyaltyConfiguration = LoyaltyConfiguration = __decorate([
    (0, typeorm_1.Entity)('loyalty_configurations')
], LoyaltyConfiguration);
//# sourceMappingURL=loyalty-configuration.entity.js.map