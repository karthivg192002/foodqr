import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { SaasPlan } from './entities/saas-plan.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Branch } from '../branches/entities/branch.entity';
import { TenantProvisioningService } from './connection/tenant-provisioning.service';
import { TenantConnectionService } from './connection/tenant-connection.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(SaasPlan) private planRepo: Repository<SaasPlan>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    private provisioning: TenantProvisioningService,
    private connections: TenantConnectionService,
  ) {}

  private async generateUniqueCode(name: string): Promise<string> {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tenant';
    let code = base;
    let suffix = 1;
    while (await this.tenantRepo.findOne({ where: { code } })) {
      code = `${base}-${suffix++}`;
    }
    return code;
  }

  // ── Plans ────────────────────────────────────────────────────────────────

  findAllPlans() {
    return this.planRepo.find({ order: { sortOrder: 'ASC', monthlyPrice: 'ASC' } });
  }

  async findOnePlan(id: string) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  createPlan(data: Partial<SaasPlan>) {
    return this.planRepo.save(this.planRepo.create(data));
  }

  async updatePlan(id: string, data: Partial<SaasPlan>) {
    await this.findOnePlan(id);
    await this.planRepo.update(id, data);
    return this.findOnePlan(id);
  }

  async removePlan(id: string) {
    await this.findOnePlan(id);
    const inUse = await this.tenantRepo.count({ where: { planId: id } });
    if (inUse > 0) throw new BadRequestException('Plan is in use by active tenants');
    await this.planRepo.delete(id);
    return { message: 'Plan deleted' };
  }

  // ── Tenants ──────────────────────────────────────────────────────────────

  findAll(status?: TenantStatus) {
    const where: any = status ? { status } : {};
    return this.tenantRepo.find({ where, relations: ['plan'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id }, relations: ['plan'] });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  /**
   * Creates a tenant record, then hands off to TenantProvisioningService to spin
   * up the tenant's own physical database (CREATE DATABASE + full schema sync +
   * default branch/admin seed). The super-admin gets back working admin
   * credentials in the same response — there is no separate onboarding step.
   */
  async create(data: Partial<Tenant> & { adminName?: string; adminEmail?: string; adminPassword?: string }) {
    if (data.planId) await this.findOnePlan(data.planId);
    const { adminName, adminEmail, adminPassword, ...tenantData } = data;

    if (adminEmail) {
      const exists = await this.userRepo.findOne({ where: { email: adminEmail } });
      if (exists) throw new BadRequestException('Admin email already registered');
    }

    const trialDays = 14;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
    const code = await this.generateUniqueCode(tenantData.name || 'tenant');
    const tenant = await this.tenantRepo.save(this.tenantRepo.create({
      ...tenantData, code, trialEndsAt, dbName: this.provisioning.toDbName(code),
    }));

    const { branch, adminCredentials } = await this.provisioning.provision(tenant.id, adminName, adminEmail, adminPassword);

    return { tenant: await this.findOne(tenant.id), branch, adminCredentials };
  }

  retryProvisioning(tenantId: string) {
    return this.provisioning.provision(tenantId);
  }

  runMigration(tenantId: string) {
    return this.provisioning.runMigration(tenantId);
  }

  runMigrationForAllActive() {
    return this.provisioning.runMigrationForAllActive();
  }

  async update(id: string, data: Partial<Tenant>) {
    await this.findOne(id);
    if (data.planId) await this.findOnePlan(data.planId);
    await this.tenantRepo.update(id, data);
    return this.findOne(id);
  }

  async suspend(id: string, reason?: string) {
    await this.findOne(id);
    await this.tenantRepo.update(id, {
      status: TenantStatus.SUSPENDED,
      suspendedAt: new Date(),
      suspendReason: reason,
    });
    return this.findOne(id);
  }

  async activate(id: string) {
    await this.findOne(id);
    await this.tenantRepo.update(id, {
      status: TenantStatus.ACTIVE,
      suspendedAt: null,
      suspendReason: null,
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.tenantRepo.delete(id);
    return { message: 'Tenant removed' };
  }

  async assignPlan(tenantId: string, planId: string, subscriptionMonths = 1) {
    await this.findOne(tenantId);
    await this.findOnePlan(planId);
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + subscriptionMonths);
    await this.tenantRepo.update(tenantId, { planId, status: TenantStatus.ACTIVE, subscriptionEndsAt });
    return this.findOne(tenantId);
  }

  // ── Super-admin Dashboard ────────────────────────────────────────────────

  async getSuperAdminDashboard() {
    const [
      totalTenants, activeTenants, trialTenants, suspendedTenants,
      masterUsers, masterOrders, plans, allTenants,
    ] = await Promise.all([
      this.tenantRepo.count(),
      this.tenantRepo.count({ where: { status: TenantStatus.ACTIVE } }),
      this.tenantRepo.count({ where: { status: TenantStatus.TRIAL } }),
      this.tenantRepo.count({ where: { status: TenantStatus.SUSPENDED } }),
      this.userRepo.count(),
      this.orderRepo.count(),
      this.planRepo.find({ order: { monthlyPrice: 'ASC' } }),
      this.tenantRepo.find({ where: { provisioningStatus: 'active' as any } }),
    ]);

    // Master DB only holds super-admins + legacy/shared-DB tenants' data; physical-DB
    // tenants' users/orders live in their own database, so we sum those in too.
    let totalUsers = masterUsers;
    let totalOrders = masterOrders;
    for (const t of allTenants) {
      if (!t.dbName) continue;
      try {
        const ds = await this.connections.getOrCreate(t.dbName);
        totalUsers += await ds.getRepository(User).count();
        totalOrders += await ds.getRepository(Order).count();
      } catch { /* unreachable tenant DB — skip rather than fail the whole dashboard */ }
    }

    const tenantsByPlan = await this.tenantRepo
      .createQueryBuilder('t')
      .leftJoin('t.plan', 'p')
      .select('p.name', 'planName')
      .addSelect('COUNT(t.id)', 'count')
      .groupBy('p.name')
      .getRawMany();

    const recentTenants = await this.tenantRepo.find({
      relations: ['plan'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const mrr = await this.tenantRepo
      .createQueryBuilder('t')
      .leftJoin('t.plan', 'p')
      .where('t.status = :s', { s: TenantStatus.ACTIVE })
      .select('SUM(p.monthlyPrice)', 'mrr')
      .getRawOne();

    return {
      summary: {
        totalTenants,
        activeTenants,
        trialTenants,
        suspendedTenants,
        totalUsers,
        totalOrders,
        mrr: parseFloat(mrr?.mrr || '0'),
      },
      tenantsByPlan,
      recentTenants,
      plans,
    };
  }

  // ── Tenant self-service (for the tenant's own admin, not super-admin) ────

  async getMyTenant(tenantId: string) {
    const tenant = await this.findOne(tenantId);
    let branchCount: number;
    let staffCount: number;
    if (tenant.dbName) {
      const ds = await this.connections.getOrCreate(tenant.dbName);
      [branchCount, staffCount] = await Promise.all([
        ds.getRepository(Branch).count(),
        ds.getRepository(User).count(),
      ]);
    } else {
      [branchCount, staffCount] = await Promise.all([
        this.branchRepo.count({ where: { tenantId } }),
        this.userRepo.count({ where: { tenantId } }),
      ]);
    }
    return {
      tenant,
      usage: {
        branchCount,
        staffCount,
        maxBranches: tenant.plan?.maxBranches ?? null,
        maxStaff: tenant.plan?.maxStaff ?? null,
      },
    };
  }

  // ── Tenant isolation scope helper ────────────────────────────────────────
  // Returns all tenant IDs for enforcement (used by middleware or guards)
  async validateTenantAccess(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (tenant.status === TenantStatus.SUSPENDED) {
      throw new BadRequestException('This tenant account is suspended');
    }
    return tenant;
  }
}
