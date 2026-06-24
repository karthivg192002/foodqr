import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { TimeSlotsService } from './time-slots.service';
import { TimeSlotsController } from './time-slots.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlot]), TenantsModule],
  providers: [TimeSlotsService],
  controllers: [TimeSlotsController],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
