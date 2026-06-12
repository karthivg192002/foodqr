import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OssController],
  providers: [OssService],
})
export class OssModule {}
