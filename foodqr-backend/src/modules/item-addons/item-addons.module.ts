import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAddon } from './entities/item-addon.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemAddonsService } from './item-addons.service';
import { ItemAddonsController } from './item-addons.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([ItemAddon, Item]), TenantsModule],
  providers: [ItemAddonsService],
  controllers: [ItemAddonsController],
  exports: [ItemAddonsService],
})
export class ItemAddonsModule {}
