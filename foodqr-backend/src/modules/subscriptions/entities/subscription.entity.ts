import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type SubscriptionFrequency = 'daily' | 'weekly' | 'monthly';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'jsonb', default: '[]' })
  items: { itemId: string; itemName: string; quantity: number; variationId?: string; extras?: any[] }[];

  @Column({ type: 'varchar', default: 'weekly' })
  frequency: SubscriptionFrequency;

  @Column({ type: 'timestamp' })
  nextOrderDate: Date;

  @Column({ nullable: true })
  branchId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  orderNote: string;

  @Column({ nullable: true })
  diningTableId: string;

  @Column({ nullable: true })
  orderType: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
