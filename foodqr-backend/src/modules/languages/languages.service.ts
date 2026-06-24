import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';
import { LanguageTranslation } from './entities/language-translation.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private langRepo: Repository<Language>,
    @InjectRepository(LanguageTranslation) private translationRepo: Repository<LanguageTranslation>,
    connections: TenantConnectionService,
  ) {
    this.langRepo = tenantAwareRepo(connections, Language, langRepo);
    this.translationRepo = tenantAwareRepo(connections, LanguageTranslation, translationRepo);
  }

  findAll() {
    return this.langRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
  }

  findActive() {
    return this.langRepo.find({ where: { isActive: true }, order: { isDefault: 'DESC', name: 'ASC' } });
  }

  async findOne(id: string) {
    const lang = await this.langRepo.findOne({ where: { id } });
    if (!lang) throw new NotFoundException('Language not found');
    return lang;
  }

  async findByCode(code: string) {
    const lang = await this.langRepo.findOne({ where: { code } });
    if (!lang) throw new NotFoundException(`Language '${code}' not found`);
    return lang;
  }

  async create(data: Partial<Language>) {
    if (data.isDefault) {
      await this.langRepo.update({}, { isDefault: false });
    }
    return this.langRepo.save(this.langRepo.create(data));
  }

  async update(id: string, data: Partial<Language>) {
    await this.findOne(id);
    if (data.isDefault) {
      await this.langRepo.update({}, { isDefault: false });
    }
    await this.langRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const lang = await this.findOne(id);
    if (lang.isDefault) throw new BadRequestException('Cannot delete the default language');
    await this.translationRepo.delete({ languageId: id });
    await this.langRepo.delete(id);
    return { message: 'Language deleted' };
  }

  async getTranslations(code: string) {
    const lang = await this.findByCode(code);
    const rows = await this.translationRepo.find({ where: { languageId: lang.id } });
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      const grp = row.group || 'general';
      if (!grouped[grp]) grouped[grp] = {};
      grouped[grp][row.key] = row.value;
    }
    return { language: lang, translations: grouped };
  }

  async upsertTranslation(languageId: string, key: string, value: string, group?: string) {
    await this.findOne(languageId);
    const existing = await this.translationRepo.findOne({ where: { languageId, key } });
    if (existing) {
      await this.translationRepo.update(existing.id, { value, group });
      return this.translationRepo.findOne({ where: { id: existing.id } });
    }
    return this.translationRepo.save(this.translationRepo.create({ languageId, key, value, group }));
  }

  async bulkUpsert(languageId: string, translations: { key: string; value: string; group?: string }[]) {
    await this.findOne(languageId);
    const results = await Promise.all(
      translations.map((t) => this.upsertTranslation(languageId, t.key, t.value, t.group)),
    );
    return { count: results.length };
  }

  async deleteTranslation(id: string) {
    await this.translationRepo.delete(id);
    return { message: 'Translation deleted' };
  }
}
