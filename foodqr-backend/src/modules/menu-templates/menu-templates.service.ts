import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MenuTemplate } from './entities/menu-template.entity';

export class CreateMenuTemplateDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsOptional()
  image?: string;

  @IsArray() @IsOptional()
  categoryIds?: string[];

  @IsBoolean() @IsOptional()
  status?: boolean;

  @IsNumber() @IsOptional() @Type(() => Number)
  sortOrder?: number;
}

@Injectable()
export class MenuTemplatesService {
  constructor(@InjectRepository(MenuTemplate) private repo: Repository<MenuTemplate>) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Menu template not found');
    return t;
  }

  create(dto: CreateMenuTemplateDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<CreateMenuTemplateDto>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Menu template deleted' };
  }

  async applyToBranch(id: string, branchId: string) {
    const template = await this.findOne(id);
    return { message: `Template "${template.name}" applied to branch ${branchId}`, templateId: id, branchId };
  }
}
