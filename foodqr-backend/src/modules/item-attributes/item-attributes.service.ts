import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemAttribute } from './entities/item-attribute.entity';
import { ItemCategoryAttribute } from './entities/item-category-attribute.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class ItemAttributesService {
  constructor(
    @InjectRepository(ItemAttribute) private attrRepo: Repository<ItemAttribute>,
    @InjectRepository(ItemCategoryAttribute) private pivotRepo: Repository<ItemCategoryAttribute>,
    @InjectRepository(ItemVariation) private variationRepo: Repository<ItemVariation>,
    connections: TenantConnectionService,
  ) {
    this.attrRepo = tenantAwareRepo(connections, ItemAttribute, attrRepo);
    this.pivotRepo = tenantAwareRepo(connections, ItemCategoryAttribute, pivotRepo);
    this.variationRepo = tenantAwareRepo(connections, ItemVariation, variationRepo);
  }

  findAll() {
    return this.attrRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const attr = await this.attrRepo.findOne({ where: { id } });
    if (!attr) throw new NotFoundException('Attribute not found');
    return attr;
  }

  create(dto: { name: string; status?: boolean }) {
    return this.attrRepo.save(this.attrRepo.create(dto));
  }

  async update(id: string, dto: { name?: string; status?: boolean }) {
    await this.findOne(id);
    await this.attrRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.attrRepo.delete(id);
    return { message: 'Attribute deleted' };
  }

  getByCategory(categoryId: string) {
    return this.pivotRepo.find({ where: { categoryId }, relations: ['attribute'] });
  }

  async assignToCategory(categoryId: string, attributeIds: string[]) {
    await this.pivotRepo.delete({ categoryId });
    const rows = attributeIds.map((attributeId) =>
      this.pivotRepo.create({ categoryId, attributeId }),
    );
    return this.pivotRepo.save(rows);
  }

  /** Returns variations for an item grouped by their attributeName */
  async listGroupByAttribute(itemId: string) {
    const variations = await this.variationRepo.find({
      where: { itemId, status: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const grouped: Record<string, typeof variations> = {};
    for (const v of variations) {
      const key = v.attributeName || 'default';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(v);
    }

    return Object.entries(grouped).map(([attributeName, items]) => ({
      attributeName,
      attributeId: items[0]?.attributeId || null,
      variations: items,
    }));
  }
}
