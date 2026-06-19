import { Repository } from 'typeorm';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { LoyaltyConfiguration } from './entities/loyalty-configuration.entity';
import { LoyaltyStamp } from './entities/loyalty-stamp.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';
import { User } from '../users/entities/user.entity';
import { LoyaltyStampCalculationType, LoyaltyRewardType, LoyaltyPeriodType } from '../../common/enums';
export declare class CreateLoyaltyConfigurationDto {
    name?: string;
    calculationType: LoyaltyStampCalculationType;
    thresholdValue?: number;
    stampsPerThreshold?: number;
    rewardType?: LoyaltyRewardType;
    rewardValue?: number;
    periodType?: LoyaltyPeriodType;
    periodLimit?: number;
    maxStampsPerPeriod?: number;
}
export declare class CreateLoyaltyProgramDto {
    name: string;
    description?: string;
    requiredStamps?: number;
    isActive?: boolean;
    autoResetStamps?: boolean;
}
export declare class LoyaltyService {
    private programRepo;
    private configRepo;
    private stampRepo;
    private rewardRepo;
    private userRepo;
    constructor(programRepo: Repository<LoyaltyProgram>, configRepo: Repository<LoyaltyConfiguration>, stampRepo: Repository<LoyaltyStamp>, rewardRepo: Repository<LoyaltyReward>, userRepo: Repository<User>);
    getPrograms(): Promise<LoyaltyProgram[]>;
    getActiveProgram(): Promise<LoyaltyProgram>;
    createProgram(data: CreateLoyaltyProgramDto): Promise<LoyaltyProgram>;
    updateProgram(id: string, data: Partial<CreateLoyaltyProgramDto>): Promise<LoyaltyProgram>;
    addConfiguration(programId: string, data: CreateLoyaltyConfigurationDto): Promise<LoyaltyConfiguration>;
    getConfiguration(id: string): Promise<LoyaltyConfiguration>;
    updateConfiguration(id: string, data: Partial<CreateLoyaltyConfigurationDto>): Promise<LoyaltyConfiguration>;
    removeConfiguration(id: string): Promise<{
        message: string;
    }>;
    getUserDashboard(userId: string): Promise<{
        program: any;
        stamps: number;
        rewards: any[];
        nextRewardAt: any;
        totalStamps?: undefined;
        pendingRewards?: undefined;
        progressPercent?: undefined;
    } | {
        program: LoyaltyProgram;
        totalStamps: number;
        pendingRewards: LoyaltyReward[];
        nextRewardAt: number;
        progressPercent: number;
        stamps?: undefined;
        rewards?: undefined;
    }>;
    earnStamps(userId: string, orderId: string, orderAmount: number): Promise<void>;
    redeemReward(userId: string, rewardId: string, orderId?: string): Promise<{
        message: string;
    }>;
    getCustomerStamps(userId: string): Promise<LoyaltyStamp[]>;
    getCustomerSegments(): Promise<{
        segments: {
            new: any[];
            bronze: any[];
            silver: any[];
            gold: any[];
        };
        summary: {
            total: number;
            new: number;
            bronze: number;
            silver: number;
            gold: number;
        };
        requiredStamps: number;
    }>;
    getLeaderboard(): Promise<any[]>;
}
