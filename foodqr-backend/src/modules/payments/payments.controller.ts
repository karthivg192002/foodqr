import {
  Controller, Get, Post, Body, Param, Headers, RawBodyRequest,
  Req, Res, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, Query,
} from '@nestjs/common';
import { Response } from 'express';
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

  @Public()
  @Post('payments/webhook/myfatoorah')
  myfatoorahWebhook(@Body() body: any) {
    return this.paymentsService.handleMyfatoorahWebhook(body);
  }

  @Public()
  @Post('payments/webhook/mollie')
  mollieWebhook(@Body() body: any) {
    return this.paymentsService.handleMollieWebhook(body);
  }

  /** Razorpay */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/razorpay/create-order')
  createRazorpayOrder(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createRazorpayOrder(orderId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/razorpay/verify')
  verifyRazorpayPayment(@Body() body: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.paymentsService.verifyRazorpayPayment(body);
  }

  @Public()
  @Post('payments/webhook/razorpay')
  razorpayWebhook(@Body() body: any) {
    return this.paymentsService.handleRazorpayWebhook(body);
  }

  /** PayPal */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/paypal/create-order')
  createPaypalOrder(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createPaypalOrder(orderId, user.id);
  }

  @Public()
  @Post('payments/paypal/capture')
  capturePaypal(@Body('paypalOrderId') paypalOrderId: string) {
    return this.paymentsService.capturePaypalPayment(paypalOrderId);
  }

  /** Paystack */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/paystack/initialize')
  createPaystackTransaction(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createPaystackTransaction(orderId, user.id);
  }

  @Public()
  @Post('payments/webhook/paystack')
  paystackWebhook(@Body() body: any) {
    return this.paymentsService.handlePaystackWebhook(body);
  }

  /** Flutterwave */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/flutterwave/initialize')
  createFlutterwavePayment(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createFlutterwavePayment(orderId, user.id);
  }

  @Public()
  @Post('payments/webhook/flutterwave')
  flutterwaveWebhook(@Body() body: any) {
    return this.paymentsService.handleFlutterwaveWebhook(body);
  }

  /** Bkash */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/bkash/initialize')
  createBkashPayment(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createBkashPayment(orderId, user.id);
  }

  /** Credit/wallet balance as payment method */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payments/credit/:orderId')
  payWithCredit(@CurrentUser() user: User, @Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.processEWalletPayment(user.id, orderId);
  }

  /** Get user's current wallet/credit balance */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('payments/credit/balance')
  getCreditBalance(@CurrentUser() user: User) {
    return this.paymentsService.getCreditBalance(user.id);
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

  /** Export transactions to Excel */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/transactions/export/excel')
  async exportTransactionsExcel(@Res() res: Response) {
    return this.paymentsService.exportTransactionsExcel(res);
  }

  /** Web redirect pages for payment callbacks */
  @Public()
  @Get('payment/success')
  paymentSuccess(@Query('orderId') orderId: string, @Query('gateway') gateway: string, @Res() res: Response) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Successful</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4}.card{text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:400px}.icon{font-size:64px}.title{color:#16a34a;font-size:24px;font-weight:700;margin:16px 0}.sub{color:#6b7280;margin-bottom:24px}.btn{background:#16a34a;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body><div class="card"><div class="icon">✅</div><div class="title">Payment Successful</div><div class="sub">Your order has been confirmed.<br>Order: <strong>${orderId || ''}</strong></div><a href="/" class="btn">Go to Home</a></div><script>window.parent?.postMessage({type:'PAYMENT_SUCCESS',orderId:'${orderId}',gateway:'${gateway}'},'*')</script></body></html>`;
    res.set('Content-Type', 'text/html').send(html);
  }

  @Public()
  @Get('payment/fail')
  paymentFail(@Query('orderId') orderId: string, @Res() res: Response) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Failed</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fef2f2}.card{text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:400px}.icon{font-size:64px}.title{color:#dc2626;font-size:24px;font-weight:700;margin:16px 0}.sub{color:#6b7280;margin-bottom:24px}.btn{background:#dc2626;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body><div class="card"><div class="icon">❌</div><div class="title">Payment Failed</div><div class="sub">Your payment could not be processed.<br>Order: <strong>${orderId || ''}</strong></div><a href="/" class="btn">Try Again</a></div><script>window.parent?.postMessage({type:'PAYMENT_FAILED',orderId:'${orderId}'},'*')</script></body></html>`;
    res.set('Content-Type', 'text/html').send(html);
  }

  @Public()
  @Get('payment/cancel')
  paymentCancel(@Query('orderId') orderId: string, @Res() res: Response) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Cancelled</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fffbeb}.card{text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:400px}.icon{font-size:64px}.title{color:#d97706;font-size:24px;font-weight:700;margin:16px 0}.sub{color:#6b7280;margin-bottom:24px}.btn{background:#d97706;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body><div class="card"><div class="icon">⚠️</div><div class="title">Payment Cancelled</div><div class="sub">You cancelled the payment.<br>Order: <strong>${orderId || ''}</strong></div><a href="/" class="btn">Go Back</a></div><script>window.parent?.postMessage({type:'PAYMENT_CANCELLED',orderId:'${orderId}'},'*')</script></body></html>`;
    res.set('Content-Type', 'text/html').send(html);
  }
}
