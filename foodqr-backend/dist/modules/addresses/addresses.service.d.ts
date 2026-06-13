import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
export declare class AddressesService {
    private repo;
    constructor(repo: Repository<Address>);
    findByUser(userId: string): Promise<Address[]>;
    findOne(id: string, userId: string): Promise<Address>;
    create(userId: string, dto: {
        label: string;
        address: string;
        apartment?: string;
        latitude?: string;
        longitude?: string;
        isDefault?: boolean;
    }): Promise<Address>;
    update(id: string, userId: string, dto: Partial<{
        label: string;
        address: string;
        apartment: string;
        latitude: string;
        longitude: string;
        isDefault: boolean;
    }>): Promise<Address>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
