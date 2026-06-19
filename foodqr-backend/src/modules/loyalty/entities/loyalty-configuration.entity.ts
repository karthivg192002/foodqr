import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { LoyaltyStampCalculationType, LoyaltyRewardType, LoyaltyPeriodType } from '../../../common/enums';
import { LoyaltyProgram } from './loyalty-program.entity';

@Entity('loyalty_configurations')
export class LoyaltyConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loyaltyProgramId: string;

  @ManyToOne(() => LoyaltyProgram, (p) => p.configurations)
  @JoinColumn({ name: 'loyaltyProgramId' })
  program: LoyaltyProgram;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: LoyaltyStampCalculationType, default: LoyaltyStampCalculationType.FIXED_PER_ORDER })
  calculationType: LoyaltyStampCalculationType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  thresholdValue: number;

  @Column({ default: 1 })
  stampsPerThreshold: number;

  @Column({ type: 'enum', enum: LoyaltyRewardType, default: LoyaltyRewardType.DISCOUNT })
  rewardType: LoyaltyRewardType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rewardValue: number;

  @Column({ type: 'enum', enum: LoyaltyPeriodType, default: LoyaltyPeriodType.LIFETIME })
  periodType: LoyaltyPeriodType;

  @Column({ nullable: true })
  periodLimit: number;

  @Column({ nullable: true })
  maxStampsPerPeriod: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
