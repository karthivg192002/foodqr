import { User } from '../../users/entities/user.entity';
import { LoyaltyProgram } from './loyalty-program.entity';
export declare class LoyaltyReward {
    id: string;
    userId: string;
    user: User;
    loyaltyProgramId: string;
    program: LoyaltyProgram;
    isRedeemed: boolean;
    redeemedAt: Date;
    redeemedOrderId: string;
    createdAt: Date;
}
