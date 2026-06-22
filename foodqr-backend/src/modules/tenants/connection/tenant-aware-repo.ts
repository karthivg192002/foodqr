import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { TenantConnectionService } from './tenant-connection.service';

/**
 * Wraps an injected (master-connection) repository in a Proxy that transparently
 * re-resolves to the current request's physical tenant database, if any, on
 * every property access — `repo.find(...)`, `repo.createQueryBuilder()`, etc. all
 * "just work" against the right DB without changing a single call site.
 *
 * This is what makes converting a 600-line service to be tenant-aware a one-line
 * change per repository instead of touching every method: assign the proxy back
 * onto the same field in the constructor and the rest of the file is unchanged.
 *
 *   constructor(
 *     @InjectRepository(Order) private orderRepo: Repository<Order>,
 *     private connections: TenantConnectionService,
 *   ) {
 *     this.orderRepo = tenantAwareRepo(connections, Order, orderRepo);
 *   }
 */
export function tenantAwareRepo<T extends ObjectLiteral>(
  connections: TenantConnectionService,
  entity: EntityTarget<T>,
  defaultRepo: Repository<T>,
): Repository<T> {
  return new Proxy(defaultRepo, {
    get(target, prop, receiver) {
      const repo = connections.repoOrDefault(entity, target);
      const value = (repo as any)[prop];
      return typeof value === 'function' ? value.bind(repo) : value;
    },
  }) as Repository<T>;
}
