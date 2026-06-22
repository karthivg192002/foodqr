import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategory } from './categories/entities/item-category.entity';
import { Item } from './items/entities/item.entity';
import { ItemVariation } from './variations/entities/item-variation.entity';
import { ItemExtra } from './extras/entities/item-extra.entity';
import { CategoriesController } from './categories/categories.controller';
import { ItemsController } from './items/items.controller';
import { ItemExtrasController } from './extras/item-extras.controller';
import { CategoriesService } from './categories/categories.service';
import { ItemsService } from './items/items.service';
import { ItemExtrasService } from './extras/item-extras.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCategory, Item, ItemVariation, ItemExtra]), TenantsModule],
  controllers: [CategoriesController, ItemsController, ItemExtrasController],
  providers: [CategoriesService, ItemsService, ItemExtrasService],
  exports: [CategoriesService, ItemsService, ItemExtrasService, TypeOrmModule],
})
export class MenuModule {}
