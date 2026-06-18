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
    async handleMyfatoorahWebhook(body) {
        const data = body?.Data || body;
        const orderId = data?.CustomerReference;
        const status = data?.InvoiceStatus;
        if (orderId && status === 'Paid') {
            const transactionId = String(data?.InvoiceId || '');
            await this.orderRepo.update(orderId, { paymentStatus: enums_1.PaymentStatus.PAID, paymentTransactionId: transactionId });
            await this.transactionRepo.update({ orderId }, { status: enums_1.PaymentStatus.PAID, gatewayTransactionId: transactionId });
        }
        return { received: true };
    }
    async handleMollieWebhook(body) {
        const paymentId = body?.id;
        if (!paymentId)
            return { received: true };
        const tx = await this.transactionRepo.findOne({ where: { gatewayTransactionId: paymentId } });
        if (tx?.orderId) {
            await this.orderRepo.update(tx.orderId, { paymentStatus: enums_1.PaymentStatus.PAID });
            await this.transactionRepo.update({ gatewayTransactionId: paymentId }, { status: enums_1.PaymentStatus.PAID });
        }
        return { received: true };
    }
    async createRazorpayOrder(orderId, userId) {
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (!keyId || !keySecret)
            throw new common_1.BadRequestException('Razorpay is not configured');
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const amountPaise = Math.round(Number(order.total) * 100);
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: orderId }),
        });
        const rzOrder = await response.json();
        if (rzOrder.error)
            throw new common_1.BadRequestException(rzOrder.error.description || 'Razorpay error');
        await this.transactionRepo.save(this.transactionRepo.create({
            userId, orderId, paymentMethod: enums_1.PaymentMethod.RAZORPAY,
            amount: order.total, gatewayTransactionId: rzOrder.id,
        }));
        return { razorpayOrderId: rzOrder.id, keyId, amount: amountPaise, currency: 'INR' };
    }
    async handleRazorpayWebhook(body) {
        const event = body?.event;
        if (event === 'payment.captured') {
            const payment = body?.payload?.payment?.entity;
            const receipt = payment?.notes?.receipt || payment?.order_id;
            if (receipt) {
                await this.orderRepo.update(receipt, { paymentStatus: enums_1.PaymentStatus.PAID, paymentTransactionId: payment.id });
                await this.transactionRepo.update({ gatewayTransactionId: payment.order_id }, { status: enums_1.PaymentStatus.PAID, gatewayTransactionId: payment.id });
            }
        }
        return { received: true };
    }
    async createPaypalOrder(orderId, userId) {
        const clientId = this.configService.get('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
        if (!clientId || !clientSecret)
            throw new common_1.BadRequestException('PayPal is not configured');
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const baseUrl = this.configService.get('PAYPAL_MODE', 'sandbox') === 'live'
            ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials',
        });
        const { access_token } = await tokenRes.json();
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
        const ppOrder = await ppRes.json();
        const approvalUrl = ppOrder.links?.find((l) => l.rel === 'approve')?.href;
        await this.transactionRepo.save(this.transactionRepo.create({
            userId, orderId, paymentMethod: enums_1.PaymentMethod.PAYPAL,
            amount: order.total, gatewayTransactionId: ppOrder.id,
        }));
        return { paypalOrderId: ppOrder.id, approvalUrl };
    }
    async capturePaypalPayment(paypalOrderId) {
        const clientId = this.configService.get('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
        const baseUrl = this.configService.get('PAYPAL_MODE', 'sandbox') === 'live'
            ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials',
        });
        const { access_token } = await tokenRes.json();
        const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        });
        const capture = await captureRes.json();
        if (capture.status === 'COMPLETED') {
            const tx = await this.transactionRepo.findOne({ where: { gatewayTransactionId: paypalOrderId } });
            if (tx?.orderId) {
                await this.orderRepo.update(tx.orderId, { paymentStatus: enums_1.PaymentStatus.PAID, paymentTransactionId: paypalOrderId });
                await this.transactionRepo.update({ gatewayTransactionId: paypalOrderId }, { status: enums_1.PaymentStatus.PAID });
            }
        }
        return { status: capture.status };
    }
    async createPaystackTransaction(orderId, userId) {
        const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
        if (!secretKey)
            throw new common_1.BadRequestException('Paystack is not configured');
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
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
        const data = await res.json();
        if (!data.status)
            throw new common_1.BadRequestException(data.message || 'Paystack error');
        await this.transactionRepo.save(this.transactionRepo.create({
            userId, orderId, paymentMethod: enums_1.PaymentMethod.PAYSTACK,
            amount: order.total, gatewayTransactionId: data.data.reference,
        }));
        return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
    }
    async handlePaystackWebhook(body) {
        if (body?.event === 'charge.success') {
            const reference = body?.data?.reference;
            if (reference) {
                await this.orderRepo.update(reference, { paymentStatus: enums_1.PaymentStatus.PAID, paymentTransactionId: reference });
                await this.transactionRepo.update({ gatewayTransactionId: reference }, { status: enums_1.PaymentStatus.PAID });
            }
        }
        return { received: true };
    }
    async createFlutterwavePayment(orderId, userId) {
        const secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY');
        if (!secretKey)
            throw new common_1.BadRequestException('Flutterwave is not configured');
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
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
        const data = await res.json();
        if (data.status !== 'success')
            throw new common_1.BadRequestException(data.message || 'Flutterwave error');
        await this.transactionRepo.save(this.transactionRepo.create({
            userId, orderId, paymentMethod: enums_1.PaymentMethod.FLUTTERWAVE,
            amount: order.total, gatewayTransactionId: orderId,
        }));
        return { paymentLink: data.data.link, txRef: orderId };
    }
    async handleFlutterwaveWebhook(body) {
        if (body?.event === 'charge.completed' && body?.data?.status === 'successful') {
            const txRef = body?.data?.tx_ref;
            if (txRef) {
                await this.orderRepo.update(txRef, { paymentStatus: enums_1.PaymentStatus.PAID, paymentTransactionId: String(body.data.id) });
                await this.transactionRepo.update({ gatewayTransactionId: txRef }, { status: enums_1.PaymentStatus.PAID });
            }
        }
        return { received: true };
    }
    async createBkashPayment(orderId, userId) {
        const appKey = this.configService.get('BKASH_APP_KEY');
        if (!appKey)
            throw new common_1.BadRequestException('Bkash is not configured');
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        await this.transactionRepo.save(this.transactionRepo.create({
            userId, orderId, paymentMethod: enums_1.PaymentMethod.BKASH, amount: order.total,
        }));
        return { message: 'Bkash payment initiated. Complete on Bkash app.', amount: order.total, orderId };
    }
    async getCreditBalance(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        return { balance: Number(user.balance || 0), currency: 'USD' };
    }
    async exportTransactionsExcel(res) {
        const { data } = await this.getTransactions(undefined, 1, 10000);
        const headers = ['Date', 'Order #', 'Customer', 'Method', 'Amount', 'Status'];
        const rows = data.map((tx) => [
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