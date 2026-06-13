import { Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
export declare class PaymentGatewaysService {
    private repo;
    constructor(repo: Repository<PaymentGateway>);
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
