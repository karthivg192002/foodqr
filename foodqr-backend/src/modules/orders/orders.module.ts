import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderAddress } from './entities/order-address.entity';
import { OrdersController } from './orders.controller';
import { TableOrderController } from './table-order.controller';
import { OrdersService } from './orders.service';
import { User } from '../users/entities/user.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';
import { LoyaltyProgram } from '../loyalty/entities/loyalty-program.entity';
import { Offer } from '../offers/entities/offer.entity';
import { OfferItem } from '../offers/entities/offer-item.entity';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { TimeSlotsModule } from '../time-slots/time-slots.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DiningTablesModule } from '../dining-tables/dining-tables.module';
import { DeliveryZonesModule } from '../delivery-zones/delivery-zones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderAddress, User, Item, ItemVariation, LoyaltyStamp, LoyaltyProgram, Offer, OfferItem, AppSetting]),
    TimeSlotsModule,
    NotificationsModule,
    DiningTablesModule,
    DeliveryZonesModule,
  ],
  controllers: [OrdersController, TableOrderController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
