import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Lives only in the master DB. Lets login resolve which tenant (and therefore
 * which physical database) a user belongs to by email, without the master DB
 * holding the user's password or any other tenant data — the authoritative
 * user record (with password) lives in the tenant's own database.
 */
@Entity('tenant_user_index')
export class TenantUserIndex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
