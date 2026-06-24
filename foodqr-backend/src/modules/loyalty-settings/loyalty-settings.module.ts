import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltySetting } from './entities/loyalty-setting.entity';
import { LoyaltySettingsService } from './loyalty-settings.service';
import { LoyaltySettingsController } from './loyalty-settings.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltySetting]), TenantsModule],
  providers: [LoyaltySettingsService],
  controllers: [LoyaltySettingsController],
  exports: [LoyaltySettingsService],
})
export class LoyaltySettingsModule {}
