import {
  Controller, Get, Post, Body, Param, Headers, RawBodyRequest,
  Req, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Get('frontend/payment/gateways')
  getGateways() { return this.paymentsService.getAvailableGateways(); }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/stripe/create-intent')
  createStripeIntent(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createStripePaymentIntent(orderId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/e-wallet/:orderId')
  payWithEWallet(@CurrentUser() user: User, @Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.processEWalletPayment(user.id, orderId);
  }

  @Public()
  @Post('payments/stripe/webhook')
  stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, sig);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/transactions')
  getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.paymentsService.getTransactions(undefined, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('transactions/my')
  getMyTransactions(@CurrentUser() user: User) {
    return this.paymentsService.getTransactions(user.id);
  }
}
