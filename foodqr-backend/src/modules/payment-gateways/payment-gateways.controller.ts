import { Controller, Get, Patch, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators';
import { PaymentGatewaysService } from './payment-gateways.service';

@ApiTags('Payment Gateways')
@Controller('payment-gateways')
export class PaymentGatewaysController {
  constructor(private readonly service: PaymentGatewaysService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll() { return this.service.findAll(); }

  @Public()
  @Get('active')
  findActive() { return this.service.findActive(); }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.service.findOne(slug); }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':slug')
  @Put(':slug')
  update(@Param('slug') slug: string, @Body() body: { isActive?: boolean; mode?: string; config?: Record<string, string> }) {
    return this.service.update(slug, body);
  }
}
