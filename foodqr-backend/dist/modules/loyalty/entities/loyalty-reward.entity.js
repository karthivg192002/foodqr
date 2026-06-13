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
exports.LoyaltyReward = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const loyalty_program_entity_1 = require("./loyalty-program.entity");
let LoyaltyReward = class LoyaltyReward {
};
exports.LoyaltyReward = LoyaltyReward;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoyaltyReward.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LoyaltyReward.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], LoyaltyReward.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LoyaltyReward.prototype, "loyaltyProgramId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => loyalty_program_entity_1.LoyaltyProgram),
    (0, typeorm_1.JoinColumn)({ name: 'loyaltyProgramId' }),
    __metadata("design:type", loyalty_program_entity_1.LoyaltyProgram)
], LoyaltyReward.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LoyaltyReward.prototype, "isRedeemed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LoyaltyReward.prototype, "redeemedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoyaltyReward.prototype, "redeemedOrderId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LoyaltyReward.prototype, "createdAt", void 0);
exports.LoyaltyReward = LoyaltyReward = __decorate([
    (0, typeorm_1.Entity)('loyalty_rewards')
], LoyaltyReward);
//# sourceMappingURL=loyalty-reward.entity.js.map