import { LoyaltyService } from './loyalty.service';
import { User } from '../users/entities/user.entity';
export declare class LoyaltyController {
    private readonly loyaltyService;
    constructor(loyaltyService: LoyaltyService);
    getMyDashboard(user: User): Promise<{
        program: any;
        stamps: number;
        rewards: any[];
        nextRewardAt: any;
        totalStamps?: undefined;
        pendingRewards?: undefined;
        progressPercent?: undefined;
    } | {
        program: import("./entities/loyalty-program.entity").LoyaltyProgram;
        totalStamps: number;
        pendingRewards: import("./entities/loyalty-reward.entity").LoyaltyReward[];
        nextRewardAt: number;
        progressPercent: number;
        stamps?: undefined;
        rewards?: undefined;
    }>;
    getMyStamps(user: User): Promise<import("./entities/loyalty-stamp.entity").LoyaltyStamp[]>;
    redeemReward(user: User, rewardId: string): Promise<{
        message: string;
    }>;
    getPrograms(): Promise<import("./entities/loyalty-program.entity").LoyaltyProgram[]>;
    createProgram(data: any): Promise<import("./entities/loyalty-program.entity").LoyaltyProgram>;
    updateProgram(id: string, data: any): Promise<import("./entities/loyalty-program.entity").LoyaltyProgram>;
    addConfiguration(id: string, data: any): Promise<import("./entities/loyalty-configuration.entity").LoyaltyConfiguration>;
}
