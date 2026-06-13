import { Item } from '../../items/entities/item.entity';
export declare class ItemExtra {
    id: string;
    itemId: string;
    item: Item;
    name: string;
    price: number;
    status: boolean;
    createdAt: Date;
}
