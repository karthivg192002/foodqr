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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("../users/entities/user.entity");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    getGateways() { return this.paymentsService.getAvailableGateways(); }
    createStripeIntent(user, orderId) {
        return this.paymentsService.createStripePaymentIntent(orderId, user.id);
    }
    payWithEWallet(user, orderId) {
        return this.paymentsService.processEWalletPayment(user.id, orderId);
    }
    stripeWebhook(req, sig) {
        return this.paymentsService.handleStripeWebhook(req.rawBody, sig);
    }
    myfatoorahWebhook(body) {
        return this.paymentsService.handleMyfatoorahWebhook(body);
    }
    mollieWebhook(body) {
        return this.paymentsService.handleMollieWebhook(body);
    }
    createRazorpayOrder(user, orderId) {
        return this.paymentsService.createRazorpayOrder(orderId, user.id);
    }
    verifyRazorpayPayment(body) {
        return this.paymentsService.verifyRazorpayPayment(body);
    }
    razorpayWebhook(body) {
        return this.paymentsService.handleRazorpayWebhook(body);
    }
    createPaypalOrder(user, orderId) {
        return this.paymentsService.createPaypalOrder(orderId, user.id);
    }
    capturePaypal(paypalOrderId) {
        return this.paymentsService.capturePaypalPayment(paypalOrderId);
    }
    createPaystackTransaction(user, orderId) {
        return this.paymentsService.createPaystackTransaction(orderId, user.id);
    }
    paystackWebhook(body) {
        return this.paymentsService.handlePaystackWebhook(body);
    }
    createFlutterwavePayment(user, orderId) {
        return this.paymentsService.createFlutterwavePayment(orderId, user.id);
    }
    flutterwaveWebhook(body) {
        return this.paymentsService.handleFlutterwaveWebhook(body);
    }
    createBkashPayment(user, orderId) {
        return this.paymentsService.createBkashPayment(orderId, user.id);
    }
    payWithCredit(user, orderId) {
        return this.paymentsService.processEWalletPayment(user.id, orderId);
    }
    getCreditBalance(user) {
        return this.paymentsService.getCreditBalance(user.id);
    }
    getTransactions(page, limit) {
        return this.paymentsService.getTransactions(undefined, page, limit);
    }
    getMyTransactions(user) {
        return this.paymentsService.getTransactions(user.id);
    }
    async exportTransactionsExcel(res) {
        return this.paymentsService.exportTransactionsExcel(res);
    }
    paymentSuccess(orderId, gateway, res) {
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Successful</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4}.card{text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:400px}.icon{font-size:64px}.title{color:#16a34a;font-size:24px;font-weight:700;margin:16px 0}.sub{color:#6b7280;margin-bottom:24px}.btn{background:#16a34a;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body><div class="card"><div class="icon">✅</div><div class="title">Payment Successful</div><div class="sub">Your order has been confirmed.<br>Order: <strong>${orderId || ''}</strong></div><a href="/" class="btn">Go to Home</a></div><script>window.parent?.postMessage({type:'PAYMENT_SUCCESS',orderId:'${orderId}',gateway:'${gateway}'},'*')</script></body></html>`;
        res.set('Content-Type', 'text/html').send(html);
    }
    paymentFail(orderId, res) {
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Failed</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fef2f2}.card{text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:400px}.icon{font-size:64px}.title{color:#dc2626;font-size:24px;font-weight:700;margin:16px 0}.sub{color:#6b7280;margin-bottom:24px}.btn{background:#dc2626;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body><div class="card"><div class="icon">❌</div><div class="title">Payment Failed</div><div class="sub">Your payment could not be processed.<br>Order: <strong>${orderId || ''}</strong></div><a href="/" class="btn">Try Again</a></div><script>window.parent?.postMessage({type:'PAYMENT_FAILED',orderId:'${orderId}'},'*')</script></body></html>`;
        res.set('Content-Type', 'text/html').send(html);
    }
    paymentCancel(orderId, res) {
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Cancelled</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fffbeb}.card{text-align:center;background:white;padding:48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:400px}.icon{font-size:64px}.title{color:#d97706;font-size:24px;font-weight:700;margin:16px 0}.sub{color:#6b7280;margin-bottom:24px}.btn{background:#d97706;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body><div class="card"><div class="icon">⚠️</div><div class="title">Payment Cancelled</div><div class="sub">You cancelled the payment.<br>Order: <strong>${orderId || ''}</strong></div><a href="/" class="btn">Go Back</a></div><script>window.parent?.postMessage({type:'PAYMENT_CANCELLED',orderId:'${orderId}'},'*')</script></body></html>`;
        res.set('Content-Type', 'text/html').send(html);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('frontend/payment/gateways'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getGateways", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/stripe/create-intent'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createStripeIntent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/e-wallet/:orderId'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "payWithEWallet", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/stripe/webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "stripeWebhook", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/webhook/myfatoorah'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "myfatoorahWebhook", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/webhook/mollie'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "mollieWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/razorpay/create-order'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createRazorpayOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/razorpay/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyRazorpayPayment", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/webhook/razorpay'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "razorpayWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/paypal/create-order'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createPaypalOrder", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/paypal/capture'),
    __param(0, (0, common_1.Body)('paypalOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "capturePaypal", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/paystack/initialize'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createPaystackTransaction", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/webhook/paystack'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paystackWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/flutterwave/initialize'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createFlutterwavePayment", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/webhook/flutterwave'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "flutterwaveWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/bkash/initialize'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createBkashPayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/credit/:orderId'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "payWithCredit", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('payments/credit/balance'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getCreditBalance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/transactions'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('transactions/my'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/transactions/export/excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "exportTransactionsExcel", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('payment/success'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Query)('gateway')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paymentSuccess", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('payment/fail'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paymentFail", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('payment/cancel'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paymentCancel", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map