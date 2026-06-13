import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), OrdersModule],
  controllers: [OssController],
  providers: [OssService],
})
export class OssModule {}
