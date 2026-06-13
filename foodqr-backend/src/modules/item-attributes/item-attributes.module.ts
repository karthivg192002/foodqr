import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAttribute } from './entities/item-attribute.entity';
import { ItemCategoryAttribute } from './entities/item-category-attribute.entity';
import { ItemAttributesService } from './item-attributes.service';
import { ItemAttributesController } from './item-attributes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItemAttribute, ItemCategoryAttribute])],
  providers: [ItemAttributesService],
  controllers: [ItemAttributesController],
  exports: [ItemAttributesService],
})
export class ItemAttributesModule {}
