import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Item } from '../../menu/items/entities/item.entity';

@Entity('item_addons')
export class ItemAddon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column()
  addonItemId: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'addonItemId' })
  addonItem: Item;

  @Column({ type: 'jsonb', nullable: true })
  addonItemVariation: object;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
