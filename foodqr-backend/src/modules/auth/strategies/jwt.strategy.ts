import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant, TenantStatus } from '../../tenants/entities/tenant.entity';
import { TenantConnectionService } from '../../tenants/connection/tenant-connection.service';
import { UserStatus } from '../../../common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private tenantConnections: TenantConnectionService,
  ) {
    super({
      // Accept token from Authorization header OR ?token= query param (needed for SSE EventSource)
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.query?.token as string || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'secret'),
      passReqToCallback: false,
    });
  }

  async validate(payload: { sub: string; email: string; role: string; tenantId?: string }) {
    if (!payload.tenantId) {
      // Super-admin, or a legacy/shared-DB tenant user — both live in the master `users` table.
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User not found or inactive');
      }
      return user;
    }

    // Tenant-scoped: re-check the tenant's status on every request (not just at login) so
    // suspending/cancelling a tenant immediately invalidates sessions already in flight —
    // this is the "no further writes/logins" half of the read-only-retention policy.
    const tenant = await this.tenantRepo.findOne({ where: { id: payload.tenantId } });
    if (!tenant) throw new UnauthorizedException('Tenant account not found');
    if (tenant.status === TenantStatus.SUSPENDED || tenant.status === TenantStatus.CANCELLED) {
      throw new UnauthorizedException('Your organization account is no longer active.');
    }

    if (!tenant.dbName) {
      // Legacy/shared-DB tenant (Phase 1) — user record is in the master DB.
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User not found or inactive');
      }
      return user;
    }

    const dataSource = await this.tenantConnections.getOrCreate(tenant.dbName);
    const user = await dataSource.getRepository(User).findOne({ where: { id: payload.sub } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }
    (user as any).tenantId = tenant.id;
    return user;
  }
}
