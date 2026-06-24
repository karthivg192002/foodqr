import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Branch } from './entities/branch.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { TenantsService } from '../tenants/tenants.service';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  slug?: string;

  @IsString() @IsOptional()
  address?: string;

  @IsString() @IsOptional()
  city?: string;

  @IsString() @IsOptional()
  state?: string;

  @IsString() @IsOptional()
  country?: string;

  @IsString() @IsOptional()
  phone?: string;

  @IsString() @IsOptional()
  email?: string;

  @IsString() @IsOptional()
  latitude?: string;

  @IsString() @IsOptional()
  longitude?: string;

  @IsString() @IsOptional()
  image?: string;

  @IsBoolean() @IsOptional()
  isDefault?: boolean;

  @IsBoolean() @IsOptional()
  status?: boolean;
}

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    private connections: TenantConnectionService,
    private tenantsService: TenantsService,
  ) {}

  /** Resolved per-request: the tenant's own database if this is a physical-DB tenant, else the master/shared DB. */
  private get repo(): Repository<Branch> {
    return this.connections.repoOrDefault(Branch, this.branchRepo);
  }

  findAll(tenantId?: string) {
    const where: any = { status: true };
    if (tenantId && !this.connections.hasTenantContext()) where.tenantId = tenantId;
    return this.repo.find({ where, order: { isDefault: 'DESC', createdAt: 'ASC' } });
  }

  async findOne(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId && !this.connections.hasTenantContext()) where.tenantId = tenantId;
    const branch = await this.repo.findOne({ where });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(dto: CreateBranchDto, tenantId?: string) {
    if (tenantId) await this.assertWithinBranchLimit(tenantId);

    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');
    const scopedTenantId = this.connections.hasTenantContext() ? undefined : tenantId;
    const branch = this.repo.create({ ...dto, slug, tenantId: scopedTenantId });
    return this.repo.save(branch);
  }

  /** Throws if the tenant's plan has a branch cap and they're already at it. `maxBranches <= 0` means unlimited. */
  private async assertWithinBranchLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsService.findOne(tenantId).catch(() => null);
    const maxBranches = tenant?.plan?.maxBranches;
    if (!maxBranches || maxBranches <= 0) return;

    const where: any = {};
    if (!this.connections.hasTenantContext()) where.tenantId = tenantId;
    const count = await this.repo.count({ where });
    if (count >= maxBranches) {
      throw new BadRequestException(`Branch limit reached for your plan (max ${maxBranches})`);
    }
  }

  async update(id: string, dto: Partial<CreateBranchDto>, tenantId?: string) {
    await this.findOne(id, tenantId);
    await this.repo.update(id, dto);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);
    await this.repo.delete(id);
    return { message: 'Branch deleted' };
  }

  async setDefault(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);
    const scope: any = tenantId && !this.connections.hasTenantContext() ? { tenantId } : {};
    await this.repo.update(scope, { isDefault: false });
    await this.repo.update(id, { isDefault: true });
    return this.findOne(id, tenantId);
  }

  async exportExcel(res: any) {
    const branches = await this.repo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
    const headers = ['Name', 'City', 'Country', 'Phone', 'Email', 'Status', 'Default'];
    const rows = branches.map((b) => [b.name, b.city || '', b.country || '', b.phone || '', b.email || '', b.status ? 'Active' : 'Inactive', b.isDefault ? 'Yes' : 'No']);
    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Branches</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="branches.xls"' });
    res.send(html);
  }
}
