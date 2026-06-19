import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { DiningTable } from './entities/dining-table.entity';
import { TableStatus } from '../../common/enums';

export class CreateDiningTableDto {
  @IsString()
  name: string;

  @IsNumber() @IsOptional() @Type(() => Number)
  capacity?: number;

  @IsString() @IsOptional()
  branchId?: string;

  @IsString() @IsOptional()
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

  async downloadQr(id: string, res: any) {
    const table = await this.findOne(id);
    if (!table.qrCode) throw new NotFoundException('QR code not generated');
    
    // Convert data URL to buffer
    const base64Data = table.qrCode.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="table-${table.name.replace(/\s+/g, '-')}-qr.png"`,
    });
    res.send(buffer);
  }

  async updateStatus(id: string, status: TableStatus) {
    await this.tableRepo.update(id, { status });
    return this.findOne(id);
  }

  async regenerateToken(id: string) {
    const token = uuidv4();
    await this.tableRepo.update(id, { accessToken: token } as any);
    return { id, accessToken: token, message: 'Session token regenerated' };
  }

  async exportExcel(branchId: string, res: any) {
    const tables = await this.findAll(branchId);
    const headers = ['Name', 'Capacity', 'Status', 'Branch', 'Waiter', 'Slug'];
    const rows = tables.map((t) => [t.name, t.capacity || '-', t.status, (t as any).branch?.name || '', (t as any).waiter?.name || '', t.slug]);
    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Dining Tables</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="dining-tables.xls"' });
    res.send(html);
  }
}
