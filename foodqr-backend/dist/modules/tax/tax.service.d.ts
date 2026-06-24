import { Repository } from 'typeorm';
import { Tax } from './entities/tax.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class CreateTaxDto {
    name: string;
    rate: number;
    type?: string;
    isIncluded?: boolean;
    isDefault?: boolean;
    status?: boolean;
}
export declare class TaxService {
    private taxRepo;
    constructor(taxRepo: Repository<Tax>, connections: TenantConnectionService);
    findAll(): Promise<Tax[]>;
    findActive(): Promise<Tax[]>;
    findOne(id: string): Promise<Tax>;
    create(dto: CreateTaxDto): Promise<Tax>;
    update(id: string, dto: Partial<CreateTaxDto>): Promise<Tax>;
    setDefault(id: string): Promise<Tax>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
