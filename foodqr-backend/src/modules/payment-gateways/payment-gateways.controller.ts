import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentGatewaysService } from './payment-gateways.service';

@ApiTags('Payment Gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-gateways')
export class PaymentGatewaysController {
  constructor(private readonly service: PaymentGatewaysService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('active')
  findActive() { return this.service.findActive(); }

  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.service.findOne(slug); }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body() body: { isActive?: boolean; mode?: string; config?: Record<string, string> }) {
    return this.service.update(slug, body);
  }
}
