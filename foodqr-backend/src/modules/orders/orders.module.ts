import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { User } from '../users/entities/user.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Item, ItemVariation, LoyaltyStamp])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
