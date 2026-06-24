import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private repo: Repository<Address>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, Address, repo);
  }

  findByUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const addr = await this.repo.findOne({ where: { id, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    return addr;
  }

  async create(userId: string, dto: { label: string; address: string; apartment?: string; latitude?: string; longitude?: string; isDefault?: boolean }) {
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async update(id: string, userId: string, dto: Partial<{ label: string; address: string; apartment: string; latitude: string; longitude: string; isDefault: boolean }>) {
    await this.findOne(id, userId);
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    await this.repo.update(id, dto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.repo.delete(id);
    return { message: 'Address deleted' };
  }
}
