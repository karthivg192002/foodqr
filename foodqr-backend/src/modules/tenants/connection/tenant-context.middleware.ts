import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { TenantConnectionService } from './tenant-connection.service';
import { tenantContextStorage } from './tenant-context';

/**
 * Resolves which physical tenant database (if any) this request belongs to
 * and runs the rest of the request inside an AsyncLocalStorage context that
 * TenantConnectionService.repoOrDefault() reads from. Tenants with no
 * physical database (dbName null — the pre-existing single-tenant / Phase 1
 * shared-DB install) fall through untouched and keep using the master
 * connection exactly as before.
 *
 * This middleware only *resolves* tenancy — it does not enforce auth. A
 * missing/invalid token simply means no tenant context is set, and
 * JwtAuthGuard still runs normally afterwards to reject the request.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private connections: TenantConnectionService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (!token) return next();

    let payload: { tenantId?: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      return next();
    }

    if (!payload?.tenantId) return next();

    const tenant = await this.tenantRepo.findOne({ where: { id: payload.tenantId } });
    if (!tenant?.dbName || tenant.provisioningStatus !== 'active') return next();

    try {
      const dataSource = await this.connections.getOrCreate(tenant.dbName);
      tenantContextStorage.run({ tenantId: tenant.id, dataSource }, () => next());
    } catch {
      next();
    }
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return (req.query?.token as string) || null;
  }
}
