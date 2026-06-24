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
exports.PaymentGatewaysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_gateway_entity_1 = require("./entities/payment-gateway.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
const DEFAULT_GATEWAYS = [
    { name: 'Stripe', slug: 'stripe' },
    { name: 'PayPal', slug: 'paypal' },
    { name: 'Razorpay', slug: 'razorpay' },
    { name: 'Cashfree', slug: 'cashfree' },
    { name: 'Mollie', slug: 'mollie' },
    { name: 'Flutterwave', slug: 'flutterwave' },
    { name: 'Paystack', slug: 'paystack' },
    { name: 'PhonePe', slug: 'phonepe' },
    { name: 'Paytm', slug: 'paytm' },
    { name: 'bKash', slug: 'bkash' },
];
let PaymentGatewaysService = class PaymentGatewaysService {
    constructor(repo, connections) {
        this.repo = repo;
        this.repo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, payment_gateway_entity_1.PaymentGateway, repo);
    }
    async onModuleInit() {
        for (const gw of DEFAULT_GATEWAYS) {
            const exists = await this.repo.findOne({ where: { slug: gw.slug } });
            if (!exists)
                await this.repo.save(this.repo.create(gw));
        }
    }
    findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
    findActive() { return this.repo.find({ where: { isActive: true } }); }
    async findOne(slug) {
        const gw = await this.repo.findOne({ where: { slug } });
        if (!gw)
            throw new common_1.NotFoundException('Payment gateway not found');
        return gw;
    }
    async update(slug, dto) {
        const gw = await this.findOne(slug);
        await this.repo.update(gw.id, dto);
        return this.findOne(slug);
    }
};
exports.PaymentGatewaysService = PaymentGatewaysService;
exports.PaymentGatewaysService = PaymentGatewaysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_gateway_entity_1.PaymentGateway)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], PaymentGatewaysService);
//# sourceMappingURL=payment-gateways.service.js.map