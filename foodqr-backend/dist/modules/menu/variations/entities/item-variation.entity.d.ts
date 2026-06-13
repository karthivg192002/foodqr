import { Item } from '../../items/entities/item.entity';
export declare class ItemVariation {
    id: string;
    itemId: string;
    item: Item;
    name: string;
    price: number;
    additionalPrice: number;
    attributeName: string;
    attributeId: string;
    priceType: string;
    caution: string;
    status: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
