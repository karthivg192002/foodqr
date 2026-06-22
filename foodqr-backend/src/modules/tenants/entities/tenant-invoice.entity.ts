import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { SaasPlan } from './saas-plan.entity';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity('tenant_invoices')
export class TenantInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  planId: string;

  @ManyToOne(() => SaasPlan, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: SaasPlan;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  /** Which of the platform's already-configured payment gateways this invoice would be charged through. */
  @Column({ nullable: true })
  gatewaySlug: string;

  @Column()
  periodStart: Date;

  @Column()
  periodEnd: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
