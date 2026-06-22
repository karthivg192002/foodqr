import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiningTable } from './entities/dining-table.entity';
import { DiningTablesController } from './dining-tables.controller';
import { DiningTablesService } from './dining-tables.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([DiningTable]), TenantsModule],
  controllers: [DiningTablesController],
  providers: [DiningTablesService],
  exports: [DiningTablesService, TypeOrmModule],
})
export class DiningTablesModule {}
