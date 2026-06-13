import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticSection } from './entities/analytic-section.entity';
import { AnalyticsSectionsService } from './analytics-sections.service';
import { AnalyticsSectionsController } from './analytics-sections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticSection])],
  providers: [AnalyticsSectionsService],
  controllers: [AnalyticsSectionsController],
  exports: [AnalyticsSectionsService],
})
export class AnalyticsSectionsModule {}
