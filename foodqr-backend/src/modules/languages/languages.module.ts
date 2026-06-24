import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguageTranslation } from './entities/language-translation.entity';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Language, LanguageTranslation]), TenantsModule],
  controllers: [LanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
