import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliveryZonesService } from './delivery-zones.service';
import { DeliveryZonesController } from './delivery-zones.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryZone]), TenantsModule],
  controllers: [DeliveryZonesController],
  providers: [DeliveryZonesService],
  exports: [DeliveryZonesService],
})
export class DeliveryZonesModule {}
