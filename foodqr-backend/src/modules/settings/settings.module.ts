import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AppSetting } from './entities/app-setting.entity';
import { UploadModule } from '../upload/upload.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting]), UploadModule, TenantsModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
