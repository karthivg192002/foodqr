import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Item } from '../../items/entities/item.entity';

@Entity('item_variations')
export class ItemVariation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string;

  @ManyToOne(() => Item, (item) => item.variations)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalPrice: number;

  @Column({ nullable: true })
  attributeName: string;

  @Column({ nullable: true })
  attributeId: string;

  // 'addon' adds to base price; 'replace' replaces base price
  @Column({ default: 'addon' })
  priceType: string;

  @Column({ nullable: true })
  caution: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
