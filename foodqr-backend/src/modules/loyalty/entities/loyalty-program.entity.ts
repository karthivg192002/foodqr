import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { LoyaltyConfiguration } from './loyalty-configuration.entity';

@Entity('loyalty_programs')
export class LoyaltyProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 10 })
  requiredStamps: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  autoResetStamps: boolean;

  @OneToMany(() => LoyaltyConfiguration, (c) => c.program)
  configurations: LoyaltyConfiguration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
