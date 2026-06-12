import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { DiningTable } from './entities/dining-table.entity';
import { TableStatus } from '../../common/enums';

export class CreateDiningTableDto {
  name: string;
  capacity?: number;
  branchId?: string;
  waiterId?: string;
}

@Injectable()
export class DiningTablesService {
  constructor(@InjectRepository(DiningTable) private tableRepo: Repository<DiningTable>) {}

  async findAll(branchId?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    return this.tableRepo.find({ where, relations: ['branch', 'waiter'], order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const table = await this.tableRepo.findOne({
      where: { id },
      relations: ['branch', 'waiter'],
    });
    if (!table) throw new NotFoundException('Dining table not found');
    return table;
  }

  async findBySlug(slug: string) {
    const table = await this.tableRepo.findOne({ where: { slug }, relations: ['branch'] });
    if (!table) throw new NotFoundException('Dining table not found');
    return table;
  }

  async create(dto: CreateDiningTableDto, frontendUrl: string) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const table = this.tableRepo.create({ ...dto, slug });
    const saved = await this.tableRepo.save(table);

    const qrUrl = `${frontendUrl}/table/${saved.slug}`;
    const qrCode = await QRCode.toDataURL(qrUrl);
    await this.tableRepo.update(saved.id, { qrCode });

    return this.findOne(saved.id);
  }

  async update(id: string, dto: Partial<CreateDiningTableDto>) {
    await this.findOne(id);
    await this.tableRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.tableRepo.delete(id);
    return { message: 'Dining table deleted' };
  }

  async regenerateQr(id: string, frontendUrl: string) {
    const table = await this.findOne(id);
    const qrUrl = `${frontendUrl}/table/${table.slug}`;
    const qrCode = await QRCode.toDataURL(qrUrl);
    await this.tableRepo.update(id, { qrCode });
    return this.findOne(id);
  }

  async updateStatus(id: string, status: TableStatus) {
    await this.tableRepo.update(id, { status });
    return this.findOne(id);
  }
}
