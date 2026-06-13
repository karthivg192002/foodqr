import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';

@Injectable()
export class PagesService {
  constructor(@InjectRepository(Page) private repo: Repository<Page>) {}

  findAll() { return this.repo.find({ order: { title: 'ASC' } }); }

  async findBySlug(slug: string) {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findOne(id: string) {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  create(dto: Partial<Page>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: Partial<Page>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Page deleted' };
  }
}
