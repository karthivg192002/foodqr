import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Reads X-Tenant-ID header (or query param tenantId) and attaches it to the
 * request so repositories can filter by tenant_id where applicable.
 * Full DB-per-tenant isolation is a platform migration concern; this
 * middleware provides the in-process isolation layer for row-level filtering.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
    if (tenantId) req.tenantId = tenantId;
    next();
  }
}
