import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TimeSlotsService } from './time-slots.service';

@ApiTags('Time Slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly service: TimeSlotsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('branch/:branchId')
  findByBranch(@Param('branchId') branchId: string) { return this.service.findByBranch(branchId); }

  @Post('branch/:branchId')
  upsert(@Param('branchId') branchId: string, @Body() body: { slots: { day: number; openingTime: string; closingTime: string; isOpen?: boolean }[] }) {
    return this.service.upsertForBranch(branchId, body.slots);
  }
}
