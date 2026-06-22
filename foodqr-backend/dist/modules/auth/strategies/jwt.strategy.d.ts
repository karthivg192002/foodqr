import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { TenantConnectionService } from '../../tenants/connection/tenant-connection.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepo;
    private tenantRepo;
    private tenantConnections;
    constructor(config: ConfigService, userRepo: Repository<User>, tenantRepo: Repository<Tenant>, tenantConnections: TenantConnectionService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
        tenantId?: string;
    }): Promise<User>;
}
export {};
