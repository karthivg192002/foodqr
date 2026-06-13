import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SmsGatewaysService } from './sms-gateways.service';

@ApiTags('SMS Gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sms-gateways')
export class SmsGatewaysController {
  constructor(private readonly service: SmsGatewaysService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.service.findOne(slug); }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body() body: { isActive?: boolean; config?: Record<string, string> }) {
    return this.service.update(slug, body);
  }
}
