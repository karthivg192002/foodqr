import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Branch } from './entities/branch.entity';

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
  constructor(@InjectRepository(Branch) private branchRepo: Repository<Branch>) {}

  findAll() {
    return this.branchRepo.find({ where: { status: true }, order: { isDefault: 'DESC', createdAt: 'ASC' } });
  }

  async findOne(id: string) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');
    const branch = this.branchRepo.create({ ...dto, slug });
    return this.branchRepo.save(branch);
  }

  async update(id: string, dto: Partial<CreateBranchDto>) {
    await this.findOne(id);
    await this.branchRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.branchRepo.delete(id);
    return { message: 'Branch deleted' };
  }

  async setDefault(id: string) {
    await this.branchRepo.update({}, { isDefault: false });
    await this.branchRepo.update(id, { isDefault: true });
    return this.findOne(id);
  }

  async exportExcel(res: any) {
    const branches = await this.branchRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
    const headers = ['Name', 'City', 'Country', 'Phone', 'Email', 'Status', 'Default'];
    const rows = branches.map((b) => [b.name, b.city || '', b.country || '', b.phone || '', b.email || '', b.status ? 'Active' : 'Inactive', b.isDefault ? 'Yes' : 'No']);
    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Branches</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="branches.xls"' });
    res.send(html);
  }
}
