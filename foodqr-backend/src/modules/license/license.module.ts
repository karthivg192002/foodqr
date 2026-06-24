import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting]), TenantsModule],
  providers: [LicenseService],
  controllers: [LicenseController],
  exports: [LicenseService],
})
export class LicenseModule {}
