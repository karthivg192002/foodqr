import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticSection } from './entities/analytic-section.entity';
import { AnalyticsSectionsService } from './analytics-sections.service';
import { AnalyticsSectionsController } from './analytics-sections.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticSection]), TenantsModule],
  providers: [AnalyticsSectionsService],
  controllers: [AnalyticsSectionsController],
  exports: [AnalyticsSectionsService],
})
export class AnalyticsSectionsModule {}
