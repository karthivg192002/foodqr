import { User } from '../../users/entities/user.entity';
export declare class Address {
    id: string;
    userId: string;
    user: User;
    label: string;
    address: string;
    apartment: string;
    latitude: string;
    longitude: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
