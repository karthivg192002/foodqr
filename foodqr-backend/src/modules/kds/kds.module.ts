import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), TenantsModule],
  controllers: [KdsController],
  providers: [KdsService],
})
export class KdsModule {}
