import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Item } from '../../menu/items/entities/item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  branchId: string;

  @Column()
  itemId: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ nullable: true })
  variationId: string;

  @Column({ nullable: true })
  variationName: string;

  @Column()
  itemName: string;

  @Column({ nullable: true })
  itemImage: string;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  taxName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxRate: number;

  @Column({ nullable: true })
  taxType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ nullable: true, type: 'jsonb' })
  itemVariations: object[];

  @Column({ nullable: true, type: 'jsonb' })
  extras: object[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  itemVariationTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  itemExtraTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ nullable: true })
  specialNote: string;
}
