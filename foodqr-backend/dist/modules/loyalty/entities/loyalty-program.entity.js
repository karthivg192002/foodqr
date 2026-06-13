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
exports.LoyaltyProgram = void 0;
const typeorm_1 = require("typeorm");
const loyalty_configuration_entity_1 = require("./loyalty-configuration.entity");
let LoyaltyProgram = class LoyaltyProgram {
};
exports.LoyaltyProgram = LoyaltyProgram;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoyaltyProgram.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LoyaltyProgram.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoyaltyProgram.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], LoyaltyProgram.prototype, "requiredStamps", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LoyaltyProgram.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LoyaltyProgram.prototype, "autoResetStamps", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => loyalty_configuration_entity_1.LoyaltyConfiguration, (c) => c.program),
    __metadata("design:type", Array)
], LoyaltyProgram.prototype, "configurations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LoyaltyProgram.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LoyaltyProgram.prototype, "updatedAt", void 0);
exports.LoyaltyProgram = LoyaltyProgram = __decorate([
    (0, typeorm_1.Entity)('loyalty_programs')
], LoyaltyProgram);
//# sourceMappingURL=loyalty-program.entity.js.map