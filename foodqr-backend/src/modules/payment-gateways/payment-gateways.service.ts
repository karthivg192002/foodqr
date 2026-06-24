import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

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

@Injectable()
export class PaymentGatewaysService {
  constructor(
    @InjectRepository(PaymentGateway) private repo: Repository<PaymentGateway>,
    connections: TenantConnectionService,
  ) {
    this.repo = tenantAwareRepo(connections, PaymentGateway, repo);
  }

  async onModuleInit() {
    for (const gw of DEFAULT_GATEWAYS) {
      const exists = await this.repo.findOne({ where: { slug: gw.slug } });
      if (!exists) await this.repo.save(this.repo.create(gw));
    }
  }

  findAll() { return this.repo.find({ order: { name: 'ASC' } }); }

  findActive() { return this.repo.find({ where: { isActive: true } }); }

  async findOne(slug: string) {
    const gw = await this.repo.findOne({ where: { slug } });
    if (!gw) throw new NotFoundException('Payment gateway not found');
    return gw;
  }

  async update(slug: string, dto: { isActive?: boolean; mode?: string; config?: Record<string, string> }) {
    const gw = await this.findOne(slug);
    await this.repo.update(gw.id, dto);
    return this.findOne(slug);
  }
}
