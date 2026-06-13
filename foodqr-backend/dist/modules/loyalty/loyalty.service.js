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
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const loyalty_program_entity_1 = require("./entities/loyalty-program.entity");
const loyalty_configuration_entity_1 = require("./entities/loyalty-configuration.entity");
const loyalty_stamp_entity_1 = require("./entities/loyalty-stamp.entity");
const loyalty_reward_entity_1 = require("./entities/loyalty-reward.entity");
const user_entity_1 = require("../users/entities/user.entity");
const enums_1 = require("../../common/enums");
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