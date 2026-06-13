import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu, MenuSection } from './entities/menu-section.entity';

@Injectable()
export class MenuSectionsService {
  constructor(
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    @InjectRepository(MenuSection) private sectionRepo: Repository<MenuSection>,
  ) {}

  // ─── Menus ───────────────────────────────────────────────────────────────

  findAllMenus() {
    return this.menuRepo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findOneMenu(id: string) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async createMenu(data: Partial<Menu>) {
    return this.menuRepo.save(this.menuRepo.create(data));
  }

  async updateMenu(id: string, data: Partial<Menu>) {
    await this.findOneMenu(id);
    await this.menuRepo.update(id, data);
    return this.findOneMenu(id);
  }

  async deleteMenu(id: string) {
    await this.menuRepo.delete(id);
    return { message: 'Menu deleted' };
  }

  // ─── Menu Sections ────────────────────────────────────────────────────────

  findSectionsByMenu(menuId: string) {
    return this.sectionRepo.find({ where: { menuId }, order: { sortOrder: 'ASC' } });
  }

  async createSection(menuId: string, data: Partial<MenuSection>) {
    return this.sectionRepo.save(this.sectionRepo.create({ ...data, menuId }));
  }

  async updateSection(id: string, data: Partial<MenuSection>) {
    await this.sectionRepo.update(id, data);
    return this.sectionRepo.findOne({ where: { id } });
  }

  async deleteSection(id: string) {
    await this.sectionRepo.delete(id);
    return { message: 'Section deleted' };
  }
}
