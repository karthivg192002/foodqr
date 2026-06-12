import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from './entities/tax.entity';

export class CreateTaxDto {
  name: string;
  rate: number;
  isIncluded?: boolean;
  isDefault?: boolean;
  status?: boolean;
}

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax) private taxRepo: Repository<Tax>,
  ) {}

  async findAll(): Promise<Tax[]> {
    return this.taxRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
  }

  async findActive(): Promise<Tax[]> {
    return this.taxRepo.find({
      where: { status: true },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tax> {
    const tax = await this.taxRepo.findOne({ where: { id } });
    if (!tax) throw new NotFoundException('Tax not found');
    return tax;
  }

  async create(dto: CreateTaxDto): Promise<Tax> {
    const tax = this.taxRepo.create(dto);
    return this.taxRepo.save(tax);
  }

  async update(id: string, dto: Partial<CreateTaxDto>): Promise<Tax> {
    await this.findOne(id);
    await this.taxRepo.update(id, dto);
    return this.findOne(id);
  }

  async setDefault(id: string): Promise<Tax> {
    await this.findOne(id);
    await this.taxRepo.update({}, { isDefault: false });
    await this.taxRepo.update(id, { isDefault: true });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.taxRepo.delete(id);
    return { message: 'Tax deleted' };
  }
}
