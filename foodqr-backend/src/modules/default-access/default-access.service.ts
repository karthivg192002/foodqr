import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultAccess } from './entities/default-access.entity';

@Injectable()
export class DefaultAccessService {
  constructor(@InjectRepository(DefaultAccess) private repo: Repository<DefaultAccess>) {}

  findAll() {
    return this.repo.find({ relations: ['user', 'branch'], order: { createdAt: 'DESC' } });
  }

  findByUser(userId: string) {
    return this.repo.find({ where: { userId }, relations: ['branch'] });
  }

  async findOne(id: string) {
    const da = await this.repo.findOne({ where: { id }, relations: ['user', 'branch'] });
    if (!da) throw new NotFoundException('Default access record not found');
    return da;
  }

  async upsert(userId: string, dto: { branchId?: string; resourceType?: string; resourceId?: string; permissions?: string[] }) {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) {
      await this.repo.update(existing.id, dto);
      return this.findOne(existing.id);
    }
    return this.repo.save(this.repo.create({ userId, ...dto }));
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Default access record deleted' };
  }
}
