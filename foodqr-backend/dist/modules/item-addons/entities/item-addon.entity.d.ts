import { Item } from '../../menu/items/entities/item.entity';
export declare class ItemAddon {
    id: string;
    itemId: string;
    item: Item;
    addonItemId: string;
    addonItem: Item;
    addonItemVariation: object;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}
