import { Repository } from 'typeorm';
import { SmsGateway } from './entities/sms-gateway.entity';
export declare class SmsGatewaysService {
    private repo;
    private readonly logger;
    constructor(repo: Repository<SmsGateway>);
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
