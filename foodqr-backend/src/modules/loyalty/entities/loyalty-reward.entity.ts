import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoyaltyProgram } from './loyalty-program.entity';

@Entity('loyalty_rewards')
export class LoyaltyReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  loyaltyProgramId: string;

  @ManyToOne(() => LoyaltyProgram)
  @JoinColumn({ name: 'loyaltyProgramId' })
  program: LoyaltyProgram;

  @Column({ default: false })
  isRedeemed: boolean;

  @Column({ nullable: true })
  redeemedAt: Date;

  @Column({ nullable: true })
  redeemedOrderId: string;

  @CreateDateColumn()
  createdAt: Date;
}
