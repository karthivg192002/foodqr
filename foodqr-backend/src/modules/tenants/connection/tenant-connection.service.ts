import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import * as path from 'path';
import { tenantContextStorage } from './tenant-context';

interface CacheEntry {
  dataSource: DataSource;
  lastUsedAt: number;
}

const IDLE_EVICTION_MS = 30 * 60 * 1000; // close tenant connections idle for 30+ minutes
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Caches one DataSource per physical tenant database (same Postgres
 * host/credentials as the master connection, isolated by database name).
 * This is the dynamic per-tenant connection resolver called out in
 * MISSING_FEATURES.md §3 — it intentionally does NOT run synchronize() on
 * every connect; schema changes go through TenantProvisioningService.
 */
@Injectable()
export class TenantConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantConnectionService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly sweepHandle: NodeJS.Timeout;

  constructor(private config: ConfigService) {
    this.sweepHandle = setInterval(() => this.evictIdle(), SWEEP_INTERVAL_MS);
  }

  private entityGlob(): string {
    return path.join(__dirname, '../../../**/*.entity{.ts,.js}');
  }

  private baseOptions(database: string, synchronize = false) {
    return {
      type: 'postgres' as const,
      host: this.config.get('DB_HOST', 'localhost'),
      port: this.config.get<number>('DB_PORT', 5432),
      username: this.config.get('DB_USERNAME', 'postgres'),
      password: this.config.get('DB_PASSWORD', 'password'),
      database,
      entities: [this.entityGlob()],
      synchronize,
      logging: false,
    };
  }

  /** Connection to the `postgres` maintenance DB — used only to CREATE DATABASE for new tenants. */
  async getAdminDataSource(): Promise<DataSource> {
    const ds = new DataSource(this.baseOptions('postgres'));
    await ds.initialize();
    return ds;
  }

  /** One-off DataSource with synchronize enabled — used by provisioning/migration, then destroyed. */
  createSyncDataSource(dbName: string): DataSource {
    return new DataSource(this.baseOptions(dbName, true));
  }

  async getOrCreate(dbName: string): Promise<DataSource> {
    const cached = this.cache.get(dbName);
    if (cached) {
      cached.lastUsedAt = Date.now();
      return cached.dataSource;
    }
    const dataSource = new DataSource(this.baseOptions(dbName, false));
    await dataSource.initialize();
    this.cache.set(dbName, { dataSource, lastUsedAt: Date.now() });
    this.logger.log(`Opened tenant connection: ${dbName}`);
    return dataSource;
  }

  /** Returns the tenant-scoped repository if the current request belongs to a physical-DB tenant, else the default (master) repository. */
  repoOrDefault<T extends ObjectLiteral>(entity: EntityTarget<T>, defaultRepo: Repository<T>): Repository<T> {
    const store = tenantContextStorage.getStore();
    if (!store) return defaultRepo;
    return store.dataSource.getRepository(entity);
  }

  /** True when the current request is running against a physical-DB tenant — i.e. the resolved
   *  repository already contains only that tenant's rows, so a manual tenantId filter is redundant
   *  (and would be wrong, since tenantId columns are unused/null inside a tenant's own database). */
  hasTenantContext(): boolean {
    return !!tenantContextStorage.getStore();
  }

  currentTenantId(): string | null {
    return tenantContextStorage.getStore()?.tenantId ?? null;
  }

  private async evictIdle() {
    const now = Date.now();
    for (const [dbName, entry] of this.cache.entries()) {
      if (now - entry.lastUsedAt > IDLE_EVICTION_MS) {
        await entry.dataSource.destroy().catch(() => null);
        this.cache.delete(dbName);
        this.logger.log(`Evicted idle tenant connection: ${dbName}`);
      }
    }
  }

  async onModuleDestroy() {
    clearInterval(this.sweepHandle);
    for (const entry of this.cache.values()) {
      await entry.dataSource.destroy().catch(() => null);
    }
  }
}
