import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderAddress } from './entities/order-address.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { User } from '../users/entities/user.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';
import { Offer } from '../offers/entities/offer.entity';
import { OfferItem } from '../offers/entities/offer-item.entity';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { TimeSlotsModule } from '../time-slots/time-slots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderAddress, User, Item, ItemVariation, LoyaltyStamp, Offer, OfferItem, AppSetting]),
    TimeSlotsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
