"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const transaction_entity_1 = require("./entities/transaction.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const enums_1 = require("../../common/enums");
let PaymentsService = class PaymentsService {
    constructor(transactionRepo, orderRepo, userRepo, configService) {
        this.transactionRepo = transactionRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.configService = configService;
        const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
        if (stripeKey)
            this.stripe = new stripe_1.default(stripeKey, { apiVersion: '2023-10-16' });
    }
    async createStripePaymentIntent(orderId, userId) {
        if (!this.stripe)
            throw new common_1.BadRequestException('Stripe is not configured');
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const intent = await this.stripe.paymentIntents.create({
            amount: Math.round(Number(order.total) * 100),
            currency: 'usd',
            metadata: { orderId, userId },
        });
        await this.transactionRepo.save(this.transactionRepo.create({
            userId,
            orderId,
            paymentMethod: enums_1.PaymentMethod.STRIPE,
            amount: order.total,
            gatewayTransactionId: intent.id,
        }));
        return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    }
    async handleStripeWebhook(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        if (event.type === 'payment_intent.succeeded') {
            const intent = event.data.object;
            const { orderId } = intent.metadata;
            await this.orderRepo.update(orderId, { paymentStatus: enums_1.PaymentStatus.PAID, paymentTransactionId: intent.id });
            await this.transactionRepo.update({ gatewayTransactionId: intent.id }, { status: enums_1.PaymentStatus.PAID });
        }
        return { received: true };
    }
    async processEWalletPayment(userId, orderId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        if (Number(user.balance) < Number(order.total)) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        await this.userRepo.decrement({ id: userId }, 'balance', Number(order.total));
        await this.orderRepo.update(orderId, { paymentStatus: enums_1.PaymentStatus.PAID });
        const transaction = this.transactionRepo.create({
            userId,
            orderId,
            paymentMethod: enums_1.PaymentMethod.E_WALLET,
            status: enums_1.PaymentStatus.PAID,
            amount: order.total,
            notes: 'E-wallet payment',
        });
        await this.transactionRepo.save(transaction);
        return { message: 'Payment successful', transaction };
    }
    async getTransactions(userId, page = 1, limit = 20) {
        const qb = this.transactionRepo.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.user', 'user')
            .leftJoinAndSelect('tx.order', 'order')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('tx.createdAt', 'DESC');
        if (userId)
            qb.where('tx.userId = :userId', { userId });
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map