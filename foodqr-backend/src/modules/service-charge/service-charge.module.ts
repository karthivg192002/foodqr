import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCharge } from './entities/service-charge.entity';
import { ServiceChargeController } from './service-charge.controller';
import { ServiceChargeService } from './service-charge.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCharge]), TenantsModule],
  controllers: [ServiceChargeController],
  providers: [ServiceChargeService],
  exports: [ServiceChargeService],
})
export class ServiceChargeModule {}
