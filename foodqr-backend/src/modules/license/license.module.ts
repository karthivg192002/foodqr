import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting])],
  providers: [LicenseService],
  controllers: [LicenseController],
  exports: [LicenseService],
})
export class LicenseModule {}
