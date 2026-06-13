import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemVariation } from '../variations/entities/item-variation.entity';
import { ItemCategory } from '../categories/entities/item-category.entity';
import { ItemType } from '../../../common/enums';

export class CreateItemDto {
  name: string;
  description?: string;
  caution?: string;
  ingredients?: string;
  price: number;
  categoryId?: string;
  itemType?: ItemType;
  thumbImage?: string;
  coverImage?: string;
  videoUrl?: string;
  gallery?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  taxId?: string;
  taxRate?: number;
  isFeatured?: boolean;
  status?: boolean;
  sortOrder?: number;
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
      .where('item.status = true')
      .groupBy('item.id, category.id')
      .orderBy('COUNT(oi.id)', 'DESC')
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
    await this.itemRepo.delete(id);
    return { message: 'Item deleted' };
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
