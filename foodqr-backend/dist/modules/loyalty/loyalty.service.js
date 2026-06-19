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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = exports.CreateLoyaltyProgramDto = exports.CreateLoyaltyConfigurationDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const loyalty_program_entity_1 = require("./entities/loyalty-program.entity");
const loyalty_configuration_entity_1 = require("./entities/loyalty-configuration.entity");
const loyalty_stamp_entity_1 = require("./entities/loyalty-stamp.entity");
const loyalty_reward_entity_1 = require("./entities/loyalty-reward.entity");
const user_entity_1 = require("../users/entities/user.entity");
const enums_1 = require("../../common/enums");
class CreateLoyaltyConfigurationDto {
}
exports.CreateLoyaltyConfigurationDto = CreateLoyaltyConfigurationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoyaltyConfigurationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.LoyaltyStampCalculationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLoyaltyConfigurationDto.prototype, "calculationType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoyaltyConfigurationDto.prototype, "thresholdValue", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoyaltyConfigurationDto.prototype, "stampsPerThreshold", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.LoyaltyRewardType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoyaltyConfigurationDto.prototype, "rewardType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoyaltyConfigurationDto.prototype, "rewardValue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.LoyaltyPeriodType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoyaltyConfigurationDto.prototype, "periodType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoyaltyConfigurationDto.prototype, "periodLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoyaltyConfigurationDto.prototype, "maxStampsPerPeriod", void 0);
class CreateLoyaltyProgramDto {
}
exports.CreateLoyaltyProgramDto = CreateLoyaltyProgramDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLoyaltyProgramDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLoyaltyProgramDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLoyaltyProgramDto.prototype, "requiredStamps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLoyaltyProgramDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLoyaltyProgramDto.prototype, "autoResetStamps", void 0);
let LoyaltyService = class LoyaltyService {
    constructor(programRepo, configRepo, stampRepo, rewardRepo, userRepo) {
        this.programRepo = programRepo;
        this.configRepo = configRepo;
        this.stampRepo = stampRepo;
        this.rewardRepo = rewardRepo;
        this.userRepo = userRepo;
    }
    async getPrograms() {
        return this.programRepo.find({ relations: ['configurations'], order: { createdAt: 'DESC' } });
    }
    async getActiveProgram() {
        return this.programRepo.findOne({
            where: { isActive: true },
            relations: ['configurations'],
        });
    }
    async createProgram(data) {
        const program = this.programRepo.create(data);
        return this.programRepo.save(program);
    }
    async updateProgram(id, data) {
        await this.programRepo.update(id, data);
        return this.programRepo.findOne({ where: { id }, relations: ['configurations'] });
    }
    async addConfiguration(programId, data) {
        const program = await this.programRepo.findOne({ where: { id: programId } });
        if (!program)
            throw new common_1.NotFoundException('Program not found');
        const config = this.configRepo.create({ ...data, loyaltyProgramId: programId });
        return this.configRepo.save(config);
    }
    async getConfiguration(id) {
        const config = await this.configRepo.findOne({ where: { id }, relations: ['program'] });
        if (!config)
            throw new common_1.NotFoundException('Configuration not found');
        return config;
    }
    async updateConfiguration(id, data) {
        await this.getConfiguration(id);
        await this.configRepo.update(id, data);
        return this.getConfiguration(id);
    }
    async removeConfiguration(id) {
        await this.getConfiguration(id);
        await this.configRepo.delete(id);
        return { message: 'Configuration deleted' };
    }
    async getUserDashboard(userId) {
        const program = await this.getActiveProgram();
        if (!program)
            return { program: null, stamps: 0, rewards: [], nextRewardAt: null };
        const stamps = await this.stampRepo.sum('stampCount', {
            userId,
            loyaltyProgramId: program.id,
        });
        const pendingRewards = await this.rewardRepo.find({
            where: { userId, loyaltyProgramId: program.id, isRedeemed: false },
        });
        return {
            program,
            totalStamps: stamps || 0,
            pendingRewards,
            nextRewardAt: program.requiredStamps,
            progressPercent: Math.min(100, Math.round(((stamps || 0) / program.requiredStamps) * 100)),
        };
    }
    async earnStamps(userId, orderId, orderAmount) {
        const program = await this.getActiveProgram();
        if (!program)
            return;
        for (const config of program.configurations) {
            let stamps = 0;
            if (config.calculationType === enums_1.LoyaltyStampCalculationType.FIXED_PER_ORDER) {
                stamps = config.stampsPerThreshold;
            }
            else if (config.calculationType === enums_1.LoyaltyStampCalculationType.ORDER_AMOUNT) {
                stamps = Math.floor(orderAmount / config.thresholdValue) * config.stampsPerThreshold;
            }
            else if (config.calculationType === enums_1.LoyaltyStampCalculationType.PERCENTAGE_BASED) {
                stamps = Math.floor((orderAmount * config.thresholdValue) / 100);
            }
            if (stamps > 0) {
                const stamp = this.stampRepo.create({
                    userId,
                    orderId,
                    loyaltyProgramId: program.id,
                    stampCount: stamps,
                    sourceType: 'order',
                });
                await this.stampRepo.save(stamp);
            }
        }
        const totalStamps = await this.stampRepo.sum('stampCount', { userId, loyaltyProgramId: program.id });
        if (totalStamps >= program.requiredStamps) {
            const reward = this.rewardRepo.create({ userId, loyaltyProgramId: program.id });
            await this.rewardRepo.save(reward);
            if (program.autoResetStamps) {
                await this.stampRepo.delete({ userId, loyaltyProgramId: program.id });
            }
        }
    }
    async redeemReward(userId, rewardId, orderId) {
        const reward = await this.rewardRepo.findOne({ where: { id: rewardId, userId, isRedeemed: false } });
        if (!reward)
            throw new common_1.NotFoundException('Reward not found or already redeemed');
        await this.rewardRepo.update(rewardId, { isRedeemed: true, redeemedAt: new Date(), redeemedOrderId: orderId });
        return { message: 'Reward redeemed successfully' };
    }
    async getCustomerStamps(userId) {
        return this.stampRepo.find({ where: { userId }, order: { earnedAt: 'DESC' }, take: 50 });
    }
    async getCustomerSegments() {
        const program = await this.getActiveProgram();
        const required = program?.requiredStamps || 10;
        const rows = await this.stampRepo
            .createQueryBuilder('stamp')
            .leftJoinAndSelect('stamp.user', 'user')
            .select(['user.id as userId', 'user.name as name', 'user.email as email', 'SUM(stamp.stampCount) as totalStamps'])
            .groupBy('user.id, user.name, user.email')
            .orderBy('totalStamps', 'DESC')
            .getRawMany();
        const segments = { new: [], bronze: [], silver: [], gold: [] };
        for (const r of rows) {
            const s = parseInt(r.totalstamps || '0');
            r.totalStamps = s;
            r.progressPercent = Math.min(100, Math.round((s / required) * 100));
            if (s === 0)
                segments.new.push(r);
            else if (s < required * 0.33)
                segments.bronze.push(r);
            else if (s < required * 0.66)
                segments.silver.push(r);
            else
                segments.gold.push(r);
        }
        return { segments, summary: { total: rows.length, new: segments.new.length, bronze: segments.bronze.length, silver: segments.silver.length, gold: segments.gold.length }, requiredStamps: required };
    }
    async getLeaderboard() {
        return this.stampRepo
            .createQueryBuilder('stamp')
            .leftJoinAndSelect('stamp.user', 'user')
            .select(['user.id as userId', 'user.name as name', 'user.email as email', 'SUM(stamp.stampCount) as totalStamps'])
            .groupBy('user.id, user.name, user.email')
            .orderBy('totalStamps', 'DESC')
            .take(20)
            .getRawMany();
    }
};
exports.LoyaltyService = LoyaltyService;
exports.LoyaltyService = LoyaltyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loyalty_program_entity_1.LoyaltyProgram)),
    __param(1, (0, typeorm_1.InjectRepository)(loyalty_configuration_entity_1.LoyaltyConfiguration)),
    __param(2, (0, typeorm_1.InjectRepository)(loyalty_stamp_entity_1.LoyaltyStamp)),
    __param(3, (0, typeorm_1.InjectRepository)(loyalty_reward_entity_1.LoyaltyReward)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LoyaltyService);
//# sourceMappingURL=loyalty.service.js.map