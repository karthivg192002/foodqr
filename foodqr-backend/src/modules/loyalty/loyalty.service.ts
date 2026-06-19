import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { LoyaltyConfiguration } from './entities/loyalty-configuration.entity';
import { LoyaltyStamp } from './entities/loyalty-stamp.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';
import { User } from '../users/entities/user.entity';
import { LoyaltyStampCalculationType, LoyaltyRewardType, LoyaltyPeriodType } from '../../common/enums';

export class CreateLoyaltyConfigurationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(LoyaltyStampCalculationType)
  @IsNotEmpty()
  calculationType: LoyaltyStampCalculationType;

  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @IsNumber()
  @IsOptional()
  stampsPerThreshold?: number;

  @IsEnum(LoyaltyRewardType)
  @IsOptional()
  rewardType?: LoyaltyRewardType;

  @IsNumber()
  @IsOptional()
  rewardValue?: number;

  @IsEnum(LoyaltyPeriodType)
  @IsOptional()
  periodType?: LoyaltyPeriodType;

  @IsNumber()
  @IsOptional()
  periodLimit?: number;

  @IsNumber()
  @IsOptional()
  maxStampsPerPeriod?: number;
}

export class CreateLoyaltyProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  requiredStamps?: number;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  autoResetStamps?: boolean;
}

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyProgram) private programRepo: Repository<LoyaltyProgram>,
    @InjectRepository(LoyaltyConfiguration) private configRepo: Repository<LoyaltyConfiguration>,
    @InjectRepository(LoyaltyStamp) private stampRepo: Repository<LoyaltyStamp>,
    @InjectRepository(LoyaltyReward) private rewardRepo: Repository<LoyaltyReward>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getPrograms() {
    return this.programRepo.find({ relations: ['configurations'], order: { createdAt: 'DESC' } });
  }

  async getActiveProgram() {
    return this.programRepo.findOne({
      where: { isActive: true },
      relations: ['configurations'],
    });
  }

  async createProgram(data: CreateLoyaltyProgramDto) {
    const program = this.programRepo.create(data);
    return this.programRepo.save(program);
  }

  async updateProgram(id: string, data: Partial<CreateLoyaltyProgramDto>) {
    await this.programRepo.update(id, data);
    return this.programRepo.findOne({ where: { id }, relations: ['configurations'] });
  }

  async addConfiguration(programId: string, data: CreateLoyaltyConfigurationDto) {
    const program = await this.programRepo.findOne({ where: { id: programId } });
    if (!program) throw new NotFoundException('Program not found');
    const config = this.configRepo.create({ ...data, loyaltyProgramId: programId });
    return this.configRepo.save(config);
  }

  async getConfiguration(id: string) {
    const config = await this.configRepo.findOne({ where: { id }, relations: ['program'] });
    if (!config) throw new NotFoundException('Configuration not found');
    return config;
  }

  async updateConfiguration(id: string, data: Partial<CreateLoyaltyConfigurationDto>) {
    await this.getConfiguration(id);
    await this.configRepo.update(id, data);
    return this.getConfiguration(id);
  }

  async removeConfiguration(id: string) {
    await this.getConfiguration(id);
    await this.configRepo.delete(id);
    return { message: 'Configuration deleted' };
  }

  async getUserDashboard(userId: string) {
    const program = await this.getActiveProgram();
    if (!program) return { program: null, stamps: 0, rewards: [], nextRewardAt: null };

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

  async earnStamps(userId: string, orderId: string, orderAmount: number) {
    const program = await this.getActiveProgram();
    if (!program) return;

    for (const config of program.configurations) {
      let stamps = 0;
      if (config.calculationType === LoyaltyStampCalculationType.FIXED_PER_ORDER) {
        stamps = config.stampsPerThreshold;
      } else if (config.calculationType === LoyaltyStampCalculationType.ORDER_AMOUNT) {
        stamps = Math.floor(orderAmount / config.thresholdValue) * config.stampsPerThreshold;
      } else if (config.calculationType === LoyaltyStampCalculationType.PERCENTAGE_BASED) {
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

  async redeemReward(userId: string, rewardId: string, orderId?: string) {
    const reward = await this.rewardRepo.findOne({ where: { id: rewardId, userId, isRedeemed: false } });
    if (!reward) throw new NotFoundException('Reward not found or already redeemed');
    await this.rewardRepo.update(rewardId, { isRedeemed: true, redeemedAt: new Date(), redeemedOrderId: orderId });
    return { message: 'Reward redeemed successfully' };
  }

  async getCustomerStamps(userId: string) {
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

    const segments = { new: [] as any[], bronze: [] as any[], silver: [] as any[], gold: [] as any[] };
    for (const r of rows) {
      const s = parseInt(r.totalstamps || '0');
      r.totalStamps = s;
      r.progressPercent = Math.min(100, Math.round((s / required) * 100));
      if (s === 0) segments.new.push(r);
      else if (s < required * 0.33) segments.bronze.push(r);
      else if (s < required * 0.66) segments.silver.push(r);
      else segments.gold.push(r);
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
}
