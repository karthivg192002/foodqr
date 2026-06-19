import { LoyaltyStampCalculationType, LoyaltyRewardType, LoyaltyPeriodType } from '../../../common/enums';
import { LoyaltyProgram } from './loyalty-program.entity';
export declare class LoyaltyConfiguration {
    id: string;
    loyaltyProgramId: string;
    program: LoyaltyProgram;
    name: string;
    calculationType: LoyaltyStampCalculationType;
    thresholdValue: number;
    stampsPerThreshold: number;
    rewardType: LoyaltyRewardType;
    rewardValue: number;
    periodType: LoyaltyPeriodType;
    periodLimit: number;
    maxStampsPerPeriod: number;
    createdAt: Date;
    updatedAt: Date;
}
