import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('saas_plans')
export class SaasPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  yearlyPrice: number;

  @Column({ default: 1 })
  maxBranches: number;

  @Column({ default: 5 })
  maxStaff: number;

  @Column({ default: -1 })
  maxMenuItems: number;

  @Column({ default: -1 })
  maxOrdersPerMonth: number;

  @Column({ type: 'simple-array', nullable: true })
  features: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  stripePriceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
