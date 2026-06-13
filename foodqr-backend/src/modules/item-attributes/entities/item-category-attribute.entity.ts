import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ItemAttribute } from './item-attribute.entity';

@Entity('item_category_attributes')
export class ItemCategoryAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @Column()
  attributeId: string;

  @ManyToOne(() => ItemAttribute, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attributeId' })
  attribute: ItemAttribute;

  @CreateDateColumn()
  createdAt: Date;
}
