import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Transaction } from './entities/transaction.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { PaymentMethod, PaymentStatus } from '../../common/enums';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey) this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  }

  async createStripePaymentIntent(orderId: string, userId: string) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'usd',
      metadata: { orderId, userId },
    });

    await this.transactionRepo.save(this.transactionRepo.create({
      userId,
      orderId,
      paymentMethod: PaymentMethod.STRIPE,
      amount: order.total,
      gatewayTransactionId: intent.id,
    }));

    return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = intent.metadata;
      await this.orderRepo.update(orderId, { paymentStatus: PaymentStatus.PAID, paymentTransactionId: intent.id });
      await this.transactionRepo.update({ gatewayTransactionId: intent.id }, { status: PaymentStatus.PAID });
    }
    return { received: true };
  }

  async processEWalletPayment(userId: string, orderId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (Number(user.balance) < Number(order.total)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    await this.userRepo.decrement({ id: userId }, 'balance', Number(order.total));
    await this.orderRepo.update(orderId, { paymentStatus: PaymentStatus.PAID });

    const transaction = this.transactionRepo.create({
      userId,
      orderId,
      paymentMethod: PaymentMethod.E_WALLET,
      status: PaymentStatus.PAID,
      amount: order.total,
      notes: 'E-wallet payment',
    });
    await this.transactionRepo.save(transaction);
    return { message: 'Payment successful', transaction };
  }

  async getTransactions(userId?: string, page = 1, limit = 20) {
    const qb = this.transactionRepo.createQueryBuilder('tx')
      .leftJoinAndSelect('tx.user', 'user')
      .leftJoinAndSelect('tx.order', 'order')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('tx.createdAt', 'DESC');
    if (userId) qb.where('tx.userId = :userId', { userId });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async handleMyfatoorahWebhook(body: any) {
    // Myfatoorah sends { Data: { InvoiceId, InvoiceStatus, CustomerReference } }
    const data = body?.Data || body;
    const orderId = data?.CustomerReference;
    const status = data?.InvoiceStatus; // 'Paid' | 'Failed'
    if (orderId && status === 'Paid') {
      const transactionId = String(data?.InvoiceId || '');
      await this.orderRepo.update(orderId, { paymentStatus: PaymentStatus.PAID, paymentTransactionId: transactionId });
      await this.transactionRepo.update({ orderId }, { status: PaymentStatus.PAID, gatewayTransactionId: transactionId });
    }
    return { received: true };
  }

  async handleMollieWebhook(body: any) {
    // Mollie sends { id: 'tr_xxxx' } — we look up the payment from DB
    const paymentId = body?.id;
    if (!paymentId) return { received: true };
    const tx = await this.transactionRepo.findOne({ where: { gatewayTransactionId: paymentId } });
    if (tx?.orderId) {
      // Mark as paid (in production, verify with Mollie API; here we trust the webhook)
      await this.orderRepo.update(tx.orderId, { paymentStatus: PaymentStatus.PAID });
      await this.transactionRepo.update({ gatewayTransactionId: paymentId }, { status: PaymentStatus.PAID });
    }
    return { received: true };
  }

  /** Razorpay: create an order and return order_id + key_id for front-end checkout */
  async createRazorpayOrder(orderId: string, userId: string) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) throw new BadRequestException('Razorpay is not configured');

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const amountPaise = Math.round(Number(order.total) * 100);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: orderId }),
    });
    const rzOrder = await response.json() as any;
    if (rzOrder.error) throw new BadRequestException(rzOrder.error.description || 'Razorpay error');

    await this.transactionRepo.save(this.transactionRepo.create({
      userId, orderId, paymentMethod: PaymentMethod.RAZORPAY,
      amount: order.total, gatewayTransactionId: rzOrder.id,
    }));

    return { razorpayOrderId: rzOrder.id, keyId, amount: amountPaise, currency: 'INR' };
  }

  async handleRazorpayWebhook(body: any) {
    const event = body?.event;
    if (event === 'payment.captured') {
      const payment = body?.payload?.payment?.entity;
      const receipt = payment?.notes?.receipt || payment?.order_id;
      if (receipt) {
        await this.orderRepo.update(receipt, { paymentStatus: PaymentStatus.PAID, paymentTransactionId: payment.id });
        await this.transactionRepo.update({ gatewayTransactionId: payment.order_id }, { status: PaymentStatus.PAID, gatewayTransactionId: payment.id });
      }
    }
    return { received: true };
  }

  /** PayPal: create an order and return approval URL */
  async createPaypalOrder(orderId: string, userId: string) {
    const clientId = this.configService.get('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new BadRequestException('PayPal is not configured');

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const baseUrl = this.configService.get('PAYPAL_MODE', 'sandbox') === 'live'
      ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Get access token
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json() as any;

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    const ppRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: Number(order.total).toFixed(2) }, custom_id: orderId }],
        application_context: {
          return_url: `${frontendUrl}/payment/success?gateway=paypal&orderId=${orderId}`,
          cancel_url: `${frontendUrl}/payment/cancel?orderId=${orderId}`,
        },
      }),
    });
    const ppOrder = await ppRes.json() as any;
    const approvalUrl = ppOrder.links?.find((l: any) => l.rel === 'approve')?.href;

    await this.transactionRepo.save(this.transactionRepo.create({
      userId, orderId, paymentMethod: PaymentMethod.PAYPAL,
      amount: order.total, gatewayTransactionId: ppOrder.id,
    }));

    return { paypalOrderId: ppOrder.id, approvalUrl };
  }

  async capturePaypalPayment(paypalOrderId: string) {
    const clientId = this.configService.get('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
    const baseUrl = this.configService.get('PAYPAL_MODE', 'sandbox') === 'live'
      ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json() as any;

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    });
    const capture = await captureRes.json() as any;

    if (capture.status === 'COMPLETED') {
      const tx = await this.transactionRepo.findOne({ where: { gatewayTransactionId: paypalOrderId } });
      if (tx?.orderId) {
        await this.orderRepo.update(tx.orderId, { paymentStatus: PaymentStatus.PAID, paymentTransactionId: paypalOrderId });
        await this.transactionRepo.update({ gatewayTransactionId: paypalOrderId }, { status: PaymentStatus.PAID });
      }
    }
    return { status: capture.status };
  }

  /** Paystack: initialize a transaction and return authorization_url */
  async createPaystackTransaction(orderId: string, userId: string) {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) throw new BadRequestException('Paystack is not configured');

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!order) throw new BadRequestException('Order not found');

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user?.email || `order+${orderId}@foodqr.app`,
        amount: Math.round(Number(order.total) * 100),
        reference: orderId,
        callback_url: `${frontendUrl}/payment/success?gateway=paystack&orderId=${orderId}`,
        metadata: { orderId, userId },
      }),
    });
    const data = await res.json() as any;
    if (!data.status) throw new BadRequestException(data.message || 'Paystack error');

    await this.transactionRepo.save(this.transactionRepo.create({
      userId, orderId, paymentMethod: PaymentMethod.PAYSTACK,
      amount: order.total, gatewayTransactionId: data.data.reference,
    }));

    return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
  }

  async handlePaystackWebhook(body: any) {
    if (body?.event === 'charge.success') {
      const reference = body?.data?.reference;
      if (reference) {
        await this.orderRepo.update(reference, { paymentStatus: PaymentStatus.PAID, paymentTransactionId: reference });
        await this.transactionRepo.update({ gatewayTransactionId: reference }, { status: PaymentStatus.PAID });
      }
    }
    return { received: true };
  }

  /** Flutterwave: create payment link */
  async createFlutterwavePayment(orderId: string, userId: string) {
    const secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY');
    if (!secretKey) throw new BadRequestException('Flutterwave is not configured');

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!order) throw new BadRequestException('Order not found');

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: orderId,
        amount: Number(order.total),
        currency: 'USD',
        redirect_url: `${frontendUrl}/payment/success?gateway=flutterwave&orderId=${orderId}`,
        customer: { email: user?.email || `order+${orderId}@foodqr.app`, name: user?.name || 'Customer' },
        customizations: { title: 'FoodQR Payment' },
      }),
    });
    const data = await res.json() as any;
    if (data.status !== 'success') throw new BadRequestException(data.message || 'Flutterwave error');

    await this.transactionRepo.save(this.transactionRepo.create({
      userId, orderId, paymentMethod: PaymentMethod.FLUTTERWAVE,
      amount: order.total, gatewayTransactionId: orderId,
    }));

    return { paymentLink: data.data.link, txRef: orderId };
  }

  async handleFlutterwaveWebhook(body: any) {
    if (body?.event === 'charge.completed' && body?.data?.status === 'successful') {
      const txRef = body?.data?.tx_ref;
      if (txRef) {
        await this.orderRepo.update(txRef, { paymentStatus: PaymentStatus.PAID, paymentTransactionId: String(body.data.id) });
        await this.transactionRepo.update({ gatewayTransactionId: txRef }, { status: PaymentStatus.PAID });
      }
    }
    return { received: true };
  }

  /** Bkash: create payment (stub — real Bkash requires grant token flow) */
  async createBkashPayment(orderId: string, userId: string) {
    const appKey = this.configService.get('BKASH_APP_KEY');
    if (!appKey) throw new BadRequestException('Bkash is not configured');

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    await this.transactionRepo.save(this.transactionRepo.create({
      userId, orderId, paymentMethod: PaymentMethod.BKASH, amount: order.total,
    }));

    // Return a placeholder — real implementation requires Bkash token API
    return { message: 'Bkash payment initiated. Complete on Bkash app.', amount: order.total, orderId };
  }

  async getCreditBalance(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return { balance: Number(user.balance || 0), currency: 'USD' };
  }

  async exportTransactionsExcel(res: any) {
    const { data } = await this.getTransactions(undefined, 1, 10000);
    const headers = ['Date', 'Order #', 'Customer', 'Method', 'Amount', 'Status'];
    const rows = data.map((tx: any) => [
      tx.createdAt?.toISOString().split('T')[0] || '',
      tx.order?.orderSerialNo || '',
      tx.user?.name || '',
      tx.paymentMethod || '',
      Number(tx.amount).toFixed(2),
      tx.status || '',
    ]);
    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Transactions</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="transactions.xls"' });
    res.send(html);
  }

  getAvailableGateways() {
    return {
      gateways: [
        { key: 'stripe', name: 'Stripe', icon: 'stripe', enabled: !!this.configService.get('STRIPE_SECRET_KEY') },
        { key: 'paypal', name: 'PayPal', icon: 'paypal', enabled: !!this.configService.get('PAYPAL_CLIENT_ID') },
        { key: 'razorpay', name: 'Razorpay', icon: 'razorpay', enabled: !!this.configService.get('RAZORPAY_KEY_ID') },
        { key: 'paystack', name: 'Paystack', icon: 'paystack', enabled: !!this.configService.get('PAYSTACK_SECRET_KEY') },
        { key: 'flutterwave', name: 'Flutterwave', icon: 'flutterwave', enabled: !!this.configService.get('FLUTTERWAVE_SECRET_KEY') },
        { key: 'bkash', name: 'bKash', icon: 'bkash', enabled: !!this.configService.get('BKASH_APP_KEY') },
        { key: 'cash_on_delivery', name: 'Cash on Delivery', icon: 'cash', enabled: true },
        { key: 'e_wallet', name: 'E-Wallet', icon: 'wallet', enabled: true },
      ],
    };
  }
}
