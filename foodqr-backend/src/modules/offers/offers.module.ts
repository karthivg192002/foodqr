import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Banner } from './entities/banner.entity';
import { PromotionBanner } from './entities/promotion-banner.entity';
import { OfferItem } from './entities/offer-item.entity';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Banner, PromotionBanner, OfferItem]), TenantsModule],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService, TypeOrmModule],
})
export class OffersModule {}
