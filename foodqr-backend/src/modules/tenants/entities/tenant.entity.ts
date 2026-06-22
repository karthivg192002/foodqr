import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { SaasPlan } from './saas-plan.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  CANCELLED = 'cancelled',
}

export enum ProvisioningStatus {
  PENDING = 'pending',
  PROVISIONING = 'provisioning',
  ACTIVE = 'active',
  FAILED = 'failed',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ nullable: true, unique: true })
  domain: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  planId: string;

  @ManyToOne(() => SaasPlan, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: SaasPlan;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Column({ nullable: true })
  adminUserId: string;

  @Column({ nullable: true })
  trialEndsAt: Date;

  @Column({ nullable: true })
  subscriptionEndsAt: Date;

  @Column({ nullable: true })
  suspendedAt: Date;

  @Column({ nullable: true })
  suspendReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // ── Physical per-tenant database (same Postgres server/credentials as the
  // master connection, isolated by database name) ──────────────────────────
  @Column({ nullable: true })
  dbName: string;

  @Column({ type: 'enum', enum: ProvisioningStatus, default: ProvisioningStatus.PENDING })
  provisioningStatus: ProvisioningStatus;

  @Column({ nullable: true })
  provisioningError: string;

  @Column({ nullable: true })
  lastMigrationAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
