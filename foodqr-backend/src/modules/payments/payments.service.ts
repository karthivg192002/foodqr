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

  getAvailableGateways() {
    return {
      gateways: [
        { key: 'stripe', name: 'Stripe', icon: 'stripe', enabled: !!this.configService.get('STRIPE_SECRET_KEY') },
        { key: 'paypal', name: 'PayPal', icon: 'paypal', enabled: !!this.configService.get('PAYPAL_CLIENT_ID') },
        { key: 'razorpay', name: 'Razorpay', icon: 'razorpay', enabled: !!this.configService.get('RAZORPAY_KEY_ID') },
        { key: 'cash_on_delivery', name: 'Cash on Delivery', icon: 'cash', enabled: true },
        { key: 'e_wallet', name: 'E-Wallet', icon: 'wallet', enabled: true },
      ],
    };
  }
}
