import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticSection } from './entities/analytic-section.entity';

@Injectable()
export class AnalyticsSectionsService {
  constructor(
    @InjectRepository(AnalyticSection) private repo: Repository<AnalyticSection>,
  ) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  findVisible() {
    return this.repo.find({ where: { isVisible: true }, order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Analytic section not found');
    return section;
  }

  create(data: Partial<AnalyticSection>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<AnalyticSection>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Deleted' };
  }

  async reorder(ids: string[]) {
    await Promise.all(ids.map((id, idx) => this.repo.update(id, { sortOrder: idx })));
    return this.findAll();
  }
}
