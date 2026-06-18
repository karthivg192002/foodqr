import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { UserRole, UserStatus } from '../../../common/enums';
import { Branch } from '../../branches/entities/branch.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: false })
  isGuest: boolean;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ nullable: true })
  deviceToken: string;

  @Column({ nullable: true })
  webToken: string;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true })
  otpExpiry: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpiry: Date;

  @Column({ nullable: true })
  phoneOtpCode: string;

  @Column({ nullable: true })
  phoneOtpExpiry: Date;

  @Column({ type: 'simple-array', nullable: true })
  dietaryPreferences: string[];

  @Column({ type: 'simple-array', nullable: true })
  cuisinePreferences: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
