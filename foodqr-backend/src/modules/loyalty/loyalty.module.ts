import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { LoyaltyConfiguration } from './entities/loyalty-configuration.entity';
import { LoyaltyStamp } from './entities/loyalty-stamp.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';
import { User } from '../users/entities/user.entity';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyProgram, LoyaltyConfiguration, LoyaltyStamp, LoyaltyReward, User]), TenantsModule],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
