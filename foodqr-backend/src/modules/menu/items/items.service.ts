import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Item } from './entities/item.entity';
import { ItemVariation } from '../variations/entities/item-variation.entity';
import { ItemCategory } from '../categories/entities/item-category.entity';
import { ItemType } from '../../../common/enums';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsOptional()
  caution?: string;

  @IsString() @IsOptional()
  ingredients?: string;

  @IsNumber() @Type(() => Number)
  price: number;

  @IsString() @IsOptional()
  categoryId?: string;

  @IsString() @IsOptional()
  subCategoryId?: string;

  @IsEnum(ItemType) @IsOptional()
  itemType?: ItemType;

  @IsString() @IsOptional()
  thumbImage?: string;

  @IsString() @IsOptional()
  coverImage?: string;

  @IsString() @IsOptional()
  videoUrl?: string;

  @IsString() @IsOptional()
  arImage?: string;

  @IsArray() @IsOptional()
  gallery?: string[];

  @IsNumber() @IsOptional() @Type(() => Number)
  calories?: number;

  @IsNumber() @IsOptional() @Type(() => Number)
  protein?: number;

  @IsNumber() @IsOptional() @Type(() => Number)
  carbs?: number;

  @IsNumber() @IsOptional() @Type(() => Number)
  fat?: number;

  @IsString() @IsOptional()
  taxId?: string;

  @IsNumber() @IsOptional() @Type(() => Number)
  taxRate?: number;

  @IsBoolean() @IsOptional()
  isFeatured?: boolean;

  @IsBoolean() @IsOptional()
  status?: boolean;

  @IsNumber() @IsOptional() @Type(() => Number)
  sortOrder?: number;

  @IsArray() @IsOptional()
  variations?: Array<{ name: string; price: number; additionalPrice?: number; attributeName?: string }>;
}

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    @InjectRepository(ItemVariation) private variationRepo: Repository<ItemVariation>,
    @InjectRepository(ItemCategory) private catRepo: Repository<ItemCategory>,
  ) {}

  /** Returns the given categoryId plus all direct child category IDs. */
  private async resolveCategoryIds(categoryId: string): Promise<string[]> {
    const children = await this.catRepo.find({ where: { parentCategoryId: categoryId } });
    return [categoryId, ...children.map((c) => c.id)];
  }

  async findAll(search?: string, categoryId?: string, isFeatured?: boolean, page = 1, limit = 20) {
    const qb = this.itemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.variations', 'variations')
      .where('item.status = true')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('item.sortOrder', 'ASC');

    if (search) qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
    if (categoryId) {
      const categoryIds = await this.resolveCategoryIds(categoryId);
      qb.andWhere('(item.categoryId IN (:...categoryIds) OR item.subCategoryId IN (:...categoryIds))', { categoryIds });
    }
    if (isFeatured !== undefined) qb.andWhere('item.isFeatured = :isFeatured', { isFeatured });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findAllAdmin(search?: string, categoryId?: string, page = 1, limit = 20) {
    const qb = this.itemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.variations', 'variations')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('item.sortOrder', 'ASC');

    if (search) qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
    if (categoryId) {
      const categoryIds = await this.resolveCategoryIds(categoryId);
      qb.andWhere('(item.categoryId IN (:...categoryIds) OR item.subCategoryId IN (:...categoryIds))', { categoryIds });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['category', 'variations'],
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async getFeatured() {
    return this.itemRepo.find({
      where: { isFeatured: true, status: true },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
      take: 10,
    });
  }

  async getPopular() {
    return this.itemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoin('order_items', 'oi', 'oi.itemId = item.id')
      .addSelect('COUNT(oi.id)', 'order_count')
      .where('item.status = true')
      .groupBy('item.id')
      .addGroupBy('category.id')
      .orderBy('order_count', 'DESC')
      .take(10)
      .getMany();
  }

  async create(dto: CreateItemDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const { variations, ...itemData } = dto;
    const item = this.itemRepo.create({ ...itemData, slug });
    const saved = await this.itemRepo.save(item);

    if (variations?.length) {
      const vars = variations.map((v) => this.variationRepo.create({ ...v, itemId: saved.id }));
      await this.variationRepo.save(vars);
    }
    return this.findOne(saved.id);
  }

  async update(id: string, dto: Partial<CreateItemDto>) {
    await this.findOne(id);
    const { variations, ...itemData } = dto;
    await this.itemRepo.update(id, itemData);

    if (variations) {
      await this.variationRepo.delete({ itemId: id });
      if (variations.length) {
        const vars = variations.map((v) => this.variationRepo.create({ ...v, itemId: id }));
        await this.variationRepo.save(vars);
      }
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.itemRepo.softDelete(id);
    return { message: 'Item deleted' };
  }

  async restore(id: string) {
    await this.itemRepo.restore(id);
    return this.findOne(id);
  }

  async exportExcel(res: any) {
    const items = await this.itemRepo.find({
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
      withDeleted: false,
    });

    const headers = ['Name', 'Description', 'Price', 'Category', 'Type', 'Caution', 'Calories', 'Status', 'Featured'];
    const rows = items.map((i) => [
      i.name, i.description || '', Number(i.price).toFixed(2), i.category?.name || '',
      i.itemType, i.caution || '', i.calories || '', i.status ? 'Active' : 'Inactive', i.isFeatured ? 'Yes' : 'No',
    ]);

    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Items</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;

    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="items.xls"' });
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

        const dto: CreateItemDto = {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price) || 0,
          categoryId: row.categoryId || undefined,
          itemType: row.itemType as any || 'veg',
          caution: row.caution,
          ingredients: row.ingredients,
          calories: row.calories ? parseFloat(row.calories) : undefined,
          protein: row.protein ? parseFloat(row.protein) : undefined,
          carbs: row.carbs ? parseFloat(row.carbs) : undefined,
          fat: row.fat ? parseFloat(row.fat) : undefined,
          taxRate: row.taxRate ? parseFloat(row.taxRate) : undefined,
          isFeatured: row.isFeatured === 'true',
          status: row.status !== 'false',
        };

        const item = await this.create(dto);
        created.push(item.id);
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    return { imported: created.length, errors };
  }

  async findAllWithDeleted(search?: string, categoryId?: string, page = 1, limit = 20) {
    const qb = this.itemRepo.createQueryBuilder('item')
      .withDeleted()
      .leftJoinAndSelect('item.category', 'category')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('item.sortOrder', 'ASC');
    if (search) qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
    if (categoryId) {
      const categoryIds = await this.resolveCategoryIds(categoryId);
      qb.andWhere('(item.categoryId IN (:...categoryIds) OR item.subCategoryId IN (:...categoryIds))', { categoryIds });
    }
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async toggleStatus(id: string) {
    const item = await this.findOne(id);
    await this.itemRepo.update(id, { status: !item.status });
    return this.findOne(id);
  }

  async toggleFeatured(id: string) {
    const item = await this.findOne(id);
    await this.itemRepo.update(id, { isFeatured: !item.isFeatured });
    return this.findOne(id);
  }
}
