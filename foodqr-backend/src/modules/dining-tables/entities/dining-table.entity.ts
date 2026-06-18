import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { TableStatus } from '../../../common/enums';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';

@Entity('dining_tables')
export class DiningTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ default: 4 })
  capacity: number;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  waiterId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'waiterId' })
  waiter: User;

  @Column({ nullable: true, type: 'text' })
  qrCode: string;

  @Column({ nullable: true })
  qrImageUrl: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ type: 'enum', enum: TableStatus, default: TableStatus.AVAILABLE })
  status: TableStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
