import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Tenant, ProvisioningStatus } from '../entities/tenant.entity';
import { TenantUserIndex } from '../entities/tenant-user-index.entity';
import { TenantConnectionService } from './tenant-connection.service';
import { NAV_MENU_SEED_ITEMS } from '../../nav-menus/nav-menus.service';
import { NavMenu } from '../../nav-menus/entities/nav-menu.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole, UserStatus } from '../../../common/enums';

/** Postgres "duplicate database" error code — thrown by CREATE DATABASE when it already exists. */
const PG_DUPLICATE_DATABASE = '42P04';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantUserIndex) private indexRepo: Repository<TenantUserIndex>,
    private connections: TenantConnectionService,
  ) {}

  toDbName(code: string): string {
    return `foodqr_tenant_${code.replace(/-/g, '_')}`;
  }

  /**
   * Creates the tenant's physical database, synchronizes the full FoodQR schema
   * into it, and seeds the same defaults a fresh single-tenant install gets
   * (nav menus, a default branch, an admin login). Idempotent — safe to retry
   * after a FAILED status.
   */
  async provision(tenantId: string, adminName?: string, adminEmail?: string, adminPassword?: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Tenant not found');

    const dbName = tenant.dbName || this.toDbName(tenant.code);
    await this.tenantRepo.update(tenant.id, { provisioningStatus: ProvisioningStatus.PROVISIONING, dbName, provisioningError: null });

    try {
      await this.createDatabaseIfMissing(dbName);

      const syncDs = this.connections.createSyncDataSource(dbName);
      await syncDs.initialize(); // synchronize:true — creates every table on first run

      await this.seedNavMenus(syncDs);
      const { branch, adminUser, tempPassword } = await this.seedDefaultBranchAndAdmin(
        syncDs, tenant, adminName, adminEmail, adminPassword,
      );

      await syncDs.destroy();

      await this.indexRepo.save(this.indexRepo.create({
        email: adminUser.email, tenantId: tenant.id, userId: adminUser.id, role: UserRole.ADMIN,
      }));

      await this.tenantRepo.update(tenant.id, {
        provisioningStatus: ProvisioningStatus.ACTIVE,
        lastMigrationAt: new Date(),
      });

      return { tenant: await this.tenantRepo.findOne({ where: { id: tenant.id } }), branch, adminCredentials: { email: adminUser.email, tempPassword } };
    } catch (e) {
      this.logger.error(`Provisioning failed for tenant ${tenant.id}: ${e.message}`, e.stack);
      await this.tenantRepo.update(tenant.id, { provisioningStatus: ProvisioningStatus.FAILED, provisioningError: e.message });
      throw new BadRequestException(`Provisioning failed: ${e.message}`);
    }
  }

  /** Re-runs schema sync against an already-provisioned tenant DB — this codebase's existing schema-management approach (synchronize) rather than versioned migration files. */
  async runMigration(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Tenant not found');
    if (!tenant.dbName) throw new BadRequestException('Tenant has no physical database to migrate');

    const backupName = await this.backupTenantDb(tenant.dbName);

    const syncDs = this.connections.createSyncDataSource(tenant.dbName);
    await syncDs.initialize();
    await syncDs.destroy();

    await this.tenantRepo.update(tenant.id, { lastMigrationAt: new Date() });
    return { message: 'Schema synchronized', lastMigrationAt: new Date(), backupName };
  }

  /**
   * Snapshots a tenant DB via Postgres's native `CREATE DATABASE ... TEMPLATE` before a schema sync —
   * cheap (file-level copy, no dump/restore) and requires no extra tooling, but only works if there are
   * no other open connections to the source DB at the moment of the copy (true here: this only runs
   * standalone from runMigration, never concurrently with a live request against the same tenant).
   */
  private async backupTenantDb(dbName: string): Promise<string> {
    const backupName = `${dbName}_bak_${Date.now()}`;
    const adminDs = await this.connections.getAdminDataSource();
    try {
      await adminDs.query(`CREATE DATABASE "${backupName}" TEMPLATE "${dbName}"`);
      this.logger.log(`Backed up ${dbName} -> ${backupName} before schema sync`);
    } finally {
      await adminDs.destroy();
    }
    return backupName;
  }

  async runMigrationForAllActive() {
    const tenants = await this.tenantRepo.find({ where: {} });
    const results: { tenantId: string; ok: boolean; error?: string }[] = [];
    for (const t of tenants) {
      if (!t.dbName) continue;
      try {
        await this.runMigration(t.id);
        results.push({ tenantId: t.id, ok: true });
      } catch (e) {
        results.push({ tenantId: t.id, ok: false, error: e.message });
      }
    }
    return results;
  }

  private async createDatabaseIfMissing(dbName: string) {
    const adminDs = await this.connections.getAdminDataSource();
    try {
      await adminDs.query(`CREATE DATABASE "${dbName}"`);
    } catch (e) {
      if (e.code !== PG_DUPLICATE_DATABASE) throw e;
    } finally {
      await adminDs.destroy();
    }
  }

  private async seedNavMenus(syncDs: import('typeorm').DataSource) {
    const repo = syncDs.getRepository(NavMenu);
    const count = await repo.count();
    if (count === 0) {
      await repo.save(NAV_MENU_SEED_ITEMS.map((s) => repo.create(s)));
    }
  }

  private async seedDefaultBranchAndAdmin(
    syncDs: import('typeorm').DataSource,
    tenant: Tenant,
    adminName?: string,
    adminEmail?: string,
    adminPassword?: string,
  ) {
    const branchRepo = syncDs.getRepository(Branch);
    const userRepo = syncDs.getRepository(User);

    const branch = await branchRepo.save(branchRepo.create({
      name: tenant.name,
      slug: tenant.code,
      email: tenant.email,
      phone: tenant.phone,
      isDefault: true,
      status: true,
    }));

    const tempPassword = adminPassword || uuidv4().slice(0, 10);
    const adminUser = await userRepo.save(userRepo.create({
      branchId: branch.id,
      name: adminName || `${tenant.name} Admin`,
      email: adminEmail || `admin@${tenant.code}.foodqr.local`,
      password: await bcrypt.hash(tempPassword, 12),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    }));

    return { branch, adminUser, tempPassword };
  }
}
