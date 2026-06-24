import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Branch } from '../../../branches/entities/branch.entity';

@Entity('item_categories')
export class ItemCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  parentCategoryId: string;

  @ManyToOne(() => ItemCategory, (cat) => cat.children, { nullable: true })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: ItemCategory;

  @OneToMany(() => ItemCategory, (cat) => cat.parentCategory)
  children: ItemCategory[];

  /** Null = visible at every branch. Set to scope a category to a single branch's menu. */
  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  variationOnly: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
