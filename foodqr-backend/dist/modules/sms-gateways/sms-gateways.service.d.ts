import { Repository } from 'typeorm';
import { SmsGateway } from './entities/sms-gateway.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class SmsGatewaysService {
    private repo;
    private readonly logger;
    constructor(repo: Repository<SmsGateway>, connections: TenantConnectionService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<SmsGateway[]>;
    findOne(slug: string): Promise<SmsGateway>;
    update(slug: string, dto: {
        isActive?: boolean;
        config?: Record<string, string>;
    }): Promise<SmsGateway>;
    send(to: string, message: string): Promise<boolean>;
    private sendViaTwilio;
}
