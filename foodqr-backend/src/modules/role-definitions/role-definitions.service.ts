import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleDefinition } from './entities/role-definition.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

const SEED_ROLES: Partial<RoleDefinition>[] = [
  { name: 'admin',          label: 'Admin',          description: 'Full system access — manages all settings, users, and reports', color: 'purple', isSystem: true },
  { name: 'branch_manager', label: 'Branch Manager', description: 'Manages a single branch — orders, staff, and settings',          color: 'blue',   isSystem: true },
  { name: 'waiter',         label: 'Waiter',         description: 'Takes orders at the table, views dining orders',                  color: 'green',  isSystem: true },
  { name: 'chef',           label: 'Chef',           description: 'Views and updates KDS order status',                              color: 'yellow', isSystem: true },
  { name: 'staff',          label: 'Staff',          description: 'General staff — limited order access',                            color: 'gray',   isSystem: true },
  { name: 'pos_operator',   label: 'POS Operator',   description: 'Operates the point-of-sale terminal',                            color: 'indigo', isSystem: true },
  { name: 'customer',       label: 'Customer',       description: 'End-customer account for ordering and loyalty',                   color: 'orange', isSystem: true },
];

@Injectable()
export class RoleDefinitionsService {
  constructor(
    @InjectRepository(RoleDefinition) private repo: Repository<RoleDefinition>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, RoleDefinition, repo);
  }

  findAll() {
    return this.repo.find({ order: { isSystem: 'DESC', label: 'ASC' } });
  }

  findActive() {
    return this.repo.find({ where: { isActive: true }, order: { isSystem: 'DESC', label: 'ASC' } });
  }

  create(dto: Partial<RoleDefinition>) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<RoleDefinition>) {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new BadRequestException('Role not found');
    if (role.isSystem) throw new BadRequestException('System roles cannot be deleted');
    return this.repo.delete(id);
  }

  async seed(force = false) {
    const count = await this.repo.count();
    if (count > 0 && !force) return { message: 'Already seeded', count };
    if (force) await this.repo.clear();
    const saved = await this.repo.save(SEED_ROLES.map((r) => this.repo.create(r)));
    return { message: 'Seeded successfully', count: saved.length };
  }

  getAvailablePermissions() {
    const modules = [
      'items', 'categories', 'orders', 'dining_tables', 'customers',
      'staff', 'branches', 'reports', 'settings', 'offers', 'loyalty',
      'payments', 'transactions', 'kds', 'pos', 'languages', 'roles',
    ];
    const actions = ['view', 'create', 'edit', 'delete', 'export', 'import'];
    const permissions: Record<string, string[]> = {};
    for (const mod of modules) {
      permissions[mod] = actions.map((a) => `${mod}_${a}`);
    }
    return { permissions, flat: Object.values(permissions).flat() };
  }

  async getPermissions(id: string) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new BadRequestException('Role not found');
    const { flat } = this.getAvailablePermissions();
    const current = role.permissions || {};
    const matrix = flat.reduce((acc, perm) => {
      acc[perm] = current[perm] ?? false;
      return acc;
    }, {} as Record<string, boolean>);
    return { roleId: id, roleName: role.name, permissions: matrix };
  }

  async setPermissions(id: string, permissions: Record<string, boolean>) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new BadRequestException('Role not found');
    await this.repo.update(id, { permissions });
    return this.getPermissions(id);
  }

  async togglePermission(id: string, permission: string, enabled: boolean) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new BadRequestException('Role not found');
    const current = role.permissions || {};
    current[permission] = enabled;
    await this.repo.update(id, { permissions: current });
    return { roleId: id, permission, enabled };
  }
}
