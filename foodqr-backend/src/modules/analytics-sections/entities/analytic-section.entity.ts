import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('analytic_sections')
export class AnalyticSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 'chart' })
  widgetType: string; // chart | counter | table | map

  @Column({ nullable: true })
  metricKey: string; // orders_count | revenue | top_items | customers

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // chart type, colors, period, etc.

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
