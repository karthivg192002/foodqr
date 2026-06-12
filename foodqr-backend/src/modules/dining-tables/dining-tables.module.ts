import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiningTable } from './entities/dining-table.entity';
import { DiningTablesController } from './dining-tables.controller';
import { DiningTablesService } from './dining-tables.service';

@Module({
  imports: [TypeOrmModule.forFeature([DiningTable])],
  controllers: [DiningTablesController],
  providers: [DiningTablesService],
  exports: [DiningTablesService, TypeOrmModule],
})
export class DiningTablesModule {}
