import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemExtra } from './entities/item-extra.entity';

export class CreateItemExtraDto {
  @IsString()
  name: string;

  @IsNumber() @Type(() => Number)
  price: number;

  @IsNumber() @IsOptional() @Min(1) @Type(() => Number)
  maxQuantity?: number;

  @IsBoolean() @IsOptional()
  isRequired?: boolean;

  @IsBoolean() @IsOptional()
  status?: boolean;
}

@Injectable()
export class ItemExtrasService {
  constructor(
    @InjectRepository(ItemExtra) private extraRepo: Repository<ItemExtra>,
  ) {}

  async findByItem(itemId: string): Promise<ItemExtra[]> {
    return this.extraRepo.find({
      where: { itemId, status: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findByItemAdmin(itemId: string): Promise<ItemExtra[]> {
    return this.extraRepo.find({
      where: { itemId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(itemId: string, dto: CreateItemExtraDto): Promise<ItemExtra> {
    const extra = this.extraRepo.create({ ...dto, itemId });
    return this.extraRepo.save(extra);
  }

  async update(id: string, dto: Partial<CreateItemExtraDto>): Promise<ItemExtra> {
    const extra = await this.extraRepo.findOne({ where: { id } });
    if (!extra) throw new NotFoundException('Extra not found');
    await this.extraRepo.update(id, dto);
    return this.extraRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<{ message: string }> {
    const extra = await this.extraRepo.findOne({ where: { id } });
    if (!extra) throw new NotFoundException('Extra not found');
    await this.extraRepo.delete(id);
    return { message: 'Extra deleted' };
  }
}
