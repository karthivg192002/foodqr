import { Repository } from 'typeorm';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { LoyaltyConfiguration } from './entities/loyalty-configuration.entity';
import { LoyaltyStamp } from './entities/loyalty-stamp.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';
import { User } from '../users/entities/user.entity';
export declare class LoyaltyService {
    private programRepo;
    private configRepo;
    private stampRepo;
    private rewardRepo;
    private userRepo;
    constructor(programRepo: Repository<LoyaltyProgram>, configRepo: Repository<LoyaltyConfiguration>, stampRepo: Repository<LoyaltyStamp>, rewardRepo: Repository<LoyaltyReward>, userRepo: Repository<User>);
    getPrograms(): Promise<LoyaltyProgram[]>;
    getActiveProgram(): Promise<LoyaltyProgram>;
    createProgram(data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram>;
    updateProgram(id: string, data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram>;
    addConfiguration(programId: string, data: Partial<LoyaltyConfiguration>): Promise<LoyaltyConfiguration>;
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
}
