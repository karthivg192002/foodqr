import { Order } from './order.entity';
import { Item } from '../../menu/items/entities/item.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    branchId: string;
    itemId: string;
    item: Item;
    variationId: string;
    variationName: string;
    itemName: string;
    itemImage: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxName: string;
    taxRate: number;
    taxType: string;
    taxAmount: number;
    itemVariations: object[];
    extras: object[];
    itemVariationTotal: number;
    itemExtraTotal: number;
    subtotal: number;
    totalPrice: number;
    specialNote: string;
}
