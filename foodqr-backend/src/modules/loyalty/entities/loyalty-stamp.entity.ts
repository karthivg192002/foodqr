import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoyaltyProgram } from './loyalty-program.entity';

@Entity('loyalty_stamps')
export class LoyaltyStamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  orderId: string;

  @Column()
  loyaltyProgramId: string;

  @ManyToOne(() => LoyaltyProgram)
  @JoinColumn({ name: 'loyaltyProgramId' })
  program: LoyaltyProgram;

  @Column({ default: 1 })
  stampCount: number;

  @Column({ nullable: true })
  sourceType: string;

  @Column({ nullable: true })
  sourceId: string;

  @Column({ nullable: true })
  configurationId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn()
  earnedAt: Date;
}
