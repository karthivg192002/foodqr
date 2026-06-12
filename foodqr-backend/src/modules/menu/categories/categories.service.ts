import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ItemCategory } from './entities/item-category.entity';

export class CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategoryId?: string;
  status?: boolean;
  sortOrder?: number;
}

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(ItemCategory) private catRepo: Repository<ItemCategory>) {}

  async findAll(includeChildren = true) {
    const categories = await this.catRepo.find({
      where: { parentCategoryId: IsNull() },
      relations: includeChildren ? ['children'] : [],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return categories;
  }

  async findAllFlat() {
    return this.catRepo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
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
}
