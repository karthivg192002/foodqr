import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), OrdersModule, TenantsModule],
  controllers: [OssController],
  providers: [OssService],
})
export class OssModule {}
