import { LoyaltyConfiguration } from './loyalty-configuration.entity';
export declare class LoyaltyProgram {
    id: string;
    name: string;
    description: string;
    requiredStamps: number;
    isActive: boolean;
    autoResetStamps: boolean;
    configurations: LoyaltyConfiguration[];
    createdAt: Date;
    updatedAt: Date;
}
