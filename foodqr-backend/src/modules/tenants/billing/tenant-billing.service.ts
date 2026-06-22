import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantInvoice, InvoiceStatus } from '../entities/tenant-invoice.entity';
import { Tenant } from '../entities/tenant.entity';
import { SaasPlan } from '../entities/saas-plan.entity';
import { PaymentGateway } from '../../payment-gateways/entities/payment-gateway.entity';

/**
 * Platform-level billing for tenant subscriptions. Reuses whichever payment
 * gateway the platform already has enabled for customer order payments
 * (PaymentGatewaysModule) rather than wiring a separate, hardcoded provider —
 * this mirrors the rest of the codebase's gateway integrations, which store
 * provider config/mode and record transactions without calling out to a
 * live provider SDK.
 */
@Injectable()
export class TenantBillingService {
  constructor(
    @InjectRepository(TenantInvoice) private invoiceRepo: Repository<TenantInvoice>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(SaasPlan) private planRepo: Repository<SaasPlan>,
    @InjectRepository(PaymentGateway) private gatewayRepo: Repository<PaymentGateway>,
  ) {}

  private async activeGatewaySlug(): Promise<string | null> {
    const gw = await this.gatewayRepo.findOne({ where: { isActive: true } });
    return gw?.slug ?? null;
  }

  async generateInvoice(tenantId: string, months = 1) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (!tenant.planId) throw new BadRequestException('Tenant has no plan assigned to bill against');
    const plan = await this.planRepo.findOne({ where: { id: tenant.planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + months);

    const invoice = this.invoiceRepo.create({
      tenantId,
      planId: plan.id,
      amount: Number(plan.monthlyPrice) * months,
      gatewaySlug: await this.activeGatewaySlug(),
      periodStart,
      periodEnd,
      status: InvoiceStatus.PENDING,
    });
    return this.invoiceRepo.save(invoice);
  }

  async markPaid(invoiceId: string) {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    await this.invoiceRepo.update(invoiceId, { status: InvoiceStatus.PAID, paidAt: new Date() });
    return this.invoiceRepo.findOne({ where: { id: invoiceId } });
  }

  async markFailed(invoiceId: string) {
    await this.invoiceRepo.update(invoiceId, { status: InvoiceStatus.FAILED });
    return this.invoiceRepo.findOne({ where: { id: invoiceId } });
  }

  listForTenant(tenantId: string) {
    return this.invoiceRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  listAll() {
    return this.invoiceRepo.find({ relations: ['tenant', 'plan'], order: { createdAt: 'DESC' } });
  }
}
