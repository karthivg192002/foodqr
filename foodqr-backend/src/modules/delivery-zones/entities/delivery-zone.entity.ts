import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

export interface ZoneVertex { lat: number; lng: number; }

@Entity('delivery_zones')
export class DeliveryZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  /** Array of {lat, lng} vertices defining the polygon boundary */
  @Column({ type: 'jsonb', default: '[]' })
  polygon: ZoneVertex[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseCharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  perKmCharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  @Column({ nullable: true })
  estimatedDeliveryMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
