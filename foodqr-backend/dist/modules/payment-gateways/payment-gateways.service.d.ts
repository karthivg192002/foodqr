import { Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class PaymentGatewaysService {
    private repo;
    constructor(repo: Repository<PaymentGateway>, connections: TenantConnectionService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<PaymentGateway[]>;
    findActive(): Promise<PaymentGateway[]>;
    findOne(slug: string): Promise<PaymentGateway>;
    update(slug: string, dto: {
        isActive?: boolean;
        mode?: string;
        config?: Record<string, string>;
    }): Promise<PaymentGateway>;
}
