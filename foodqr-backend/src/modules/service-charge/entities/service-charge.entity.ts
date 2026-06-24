import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('service_charges')
export class ServiceCharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // 'included' = service charge included in price | 'excluded' = added on top
  @Column({ default: 'excluded' })
  type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number;

  @Column({ default: false })
  isIncluded: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
