import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCategory } from './entities/item-category.entity';
import { TenantConnectionService } from '../../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../../tenants/connection/tenant-aware-repo';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsOptional()
  icon?: string;

  @IsString() @IsOptional()
  image?: string;

  @IsString() @IsOptional()
  parentCategoryId?: string;

  @IsString() @IsOptional()
  branchId?: string;

  @IsBoolean() @IsOptional()
  status?: boolean;

  @IsBoolean() @IsOptional()
  variationOnly?: boolean;

  @IsNumber() @IsOptional() @Type(() => Number)
  sortOrder?: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ItemCategory) private catRepo: Repository<ItemCategory>,
    connections: TenantConnectionService,
  ) {
    this.catRepo = tenantAwareRepo(connections, ItemCategory, catRepo);
  }

  async findAll(includeChildren = true, branchId?: string) {
    const qb = this.catRepo.createQueryBuilder('category')
      .where('category.parentCategoryId IS NULL')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');
    if (includeChildren) qb.leftJoinAndSelect('category.children', 'children');
    if (branchId) qb.andWhere('(category.branchId IS NULL OR category.branchId = :branchId)', { branchId });
    return qb.getMany();
  }

  async findAllFlat(branchId?: string) {
    const qb = this.catRepo.createQueryBuilder('category')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');
    if (branchId) qb.andWhere('(category.branchId IS NULL OR category.branchId = :branchId)', { branchId });
    return qb.getMany();
  }

  async findOne(id: string) {
    const cat = await this.catRepo.findOne({ where: { id }, relations: ['children', 'parentCategory'] });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const cat = this.catRepo.create({ ...dto, slug });
    return this.catRepo.save(cat);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    await this.findOne(id);
    await this.catRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.catRepo.delete(id);
    return { message: 'Category deleted' };
  }

  async updateSortOrder(items: Array<{ id: string; sortOrder: number }>) {
    await Promise.all(items.map((i) => this.catRepo.update(i.id, { sortOrder: i.sortOrder })));
    return { message: 'Sort order updated' };
  }

  async exportExcel(res: any) {
    const cats = await this.catRepo.find({
      relations: ['parentCategory'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const headers = ['Name', 'Description', 'Parent Category', 'Status', 'Variation Only', 'Sort Order'];
    const rows = cats.map((c) => [
      c.name, c.description || '', c.parentCategory?.name || '',
      c.status ? 'Active' : 'Inactive', c.variationOnly ? 'Yes' : 'No', c.sortOrder,
    ]);

    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Categories</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;

    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="categories.xls"' });
    res.send(html);
  }

  async importFromCsv(csvContent: string) {
    const lines = csvContent.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return { imported: 0, errors: ['Empty file'] };

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const created: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((v) => v.trim().replace(/^"|"$/g, '')) || [];
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => (row[h] = values[idx] || ''));

        if (!row.name) { errors.push(`Row ${i + 1}: missing name`); continue; }

        const dto: CreateCategoryDto = {
          name: row.name,
          description: row.description,
          parentCategoryId: row.parentCategoryId || undefined,
          status: row.status !== 'false',
          variationOnly: row.variationOnly === 'true',
        };

        const cat = await this.create(dto);
        created.push(cat.id);
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    return { imported: created.length, errors };
  }
}
