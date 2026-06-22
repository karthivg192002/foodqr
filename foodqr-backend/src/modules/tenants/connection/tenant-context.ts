import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';

export interface TenantContextStore {
  tenantId: string;
  dataSource: DataSource;
}

/**
 * Carries the resolved per-tenant DataSource through a request without
 * needing request-scoped DI (which would force every consuming service to
 * become request-scoped too). Set once per request by TenantContextMiddleware;
 * read by TenantConnectionService.repoOrDefault() wherever a service needs to
 * know whether the current request belongs to a physical-DB tenant.
 */
export const tenantContextStorage = new AsyncLocalStorage<TenantContextStore>();

export function getTenantDataSource(): DataSource | null {
  return tenantContextStorage.getStore()?.dataSource ?? null;
}
