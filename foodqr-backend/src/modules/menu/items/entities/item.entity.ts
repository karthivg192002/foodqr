import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { ItemType } from '../../../../common/enums';
import { ItemCategory } from '../../categories/entities/item-category.entity';
import { ItemVariation } from '../../variations/entities/item-variation.entity';
import { Branch } from '../../../branches/entities/branch.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  caution: string;

  @Column({ nullable: true })
  ingredients: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => ItemCategory, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: ItemCategory;

  @Column({ nullable: true })
  subCategoryId: string;

  /** Null = visible at every branch. Set to scope an item to a single branch's menu. */
  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'enum', enum: ItemType, default: ItemType.VEG })
  itemType: ItemType;

  @Column({ nullable: true })
  thumbImage: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  arImage: string;

  @Column({ type: 'simple-array', nullable: true })
  gallery: string[];

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  calories: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  protein: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  carbs: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fat: number;

  @Column({ nullable: true })
  taxId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  status: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => ItemVariation, (v) => v.item)
  variations: ItemVariation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
