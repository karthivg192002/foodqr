import { User } from '../../users/entities/user.entity';
import { LoyaltyProgram } from './loyalty-program.entity';
export declare class LoyaltyStamp {
    id: string;
    userId: string;
    user: User;
    orderId: string;
    loyaltyProgramId: string;
    program: LoyaltyProgram;
    stampCount: number;
    sourceType: string;
    sourceId: string;
    configurationId: string;
    metadata: object;
    earnedAt: Date;
}
