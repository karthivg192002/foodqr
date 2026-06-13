import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Language } from './entities/language.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@Controller()
export class LanguagesController {
  constructor(private readonly service: LanguagesService) {}

  @Public()
  @Get('frontend/languages')
  getActive() {
    return this.service.findActive();
  }

  @Public()
  @Get('frontend/languages/:code/translations')
  getTranslations(@Param('code') code: string) {
    return this.service.getTranslations(code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/languages')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/languages/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/languages')
  create(@Body() body: Partial<Language>) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/languages/:id')
  update(@Param('id') id: string, @Body() body: Partial<Language>) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/languages/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/languages/:id/translations')
  upsertTranslation(
    @Param('id') id: string,
    @Body() body: { key: string; value: string; group?: string },
  ) {
    return this.service.upsertTranslation(id, body.key, body.value, body.group);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/languages/:id/translations/bulk')
  bulkUpsert(
    @Param('id') id: string,
    @Body() body: { translations: { key: string; value: string; group?: string }[] },
  ) {
    return this.service.bulkUpsert(id, body.translations);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/languages/translations/:translationId')
  deleteTranslation(@Param('translationId') translationId: string) {
    return this.service.deleteTranslation(translationId);
  }
}
