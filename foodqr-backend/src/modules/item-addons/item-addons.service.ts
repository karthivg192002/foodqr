import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemAddon } from './entities/item-addon.entity';

@Injectable()
export class ItemAddonsService {
  constructor(@InjectRepository(ItemAddon) private repo: Repository<ItemAddon>) {}

  findByItem(itemId: string) {
    return this.repo.find({ where: { itemId }, relations: ['addonItem'] });
  }

  create(dto: { itemId: string; addonItemId: string; addonItemVariation?: object }) {
    return this.repo.save(this.repo.create(dto));
  }

  async remove(id: string) {
    const addon = await this.repo.findOne({ where: { id } });
    if (!addon) throw new NotFoundException('Addon not found');
    await this.repo.delete(id);
    return { message: 'Addon removed' };
  }
}
