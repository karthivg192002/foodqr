import { Offer } from './offer.entity';
import { Item } from '../../menu/items/entities/item.entity';
export declare class OfferItem {
    id: string;
    offerId: string;
    offer: Offer;
    itemId: string;
    item: Item;
    createdAt: Date;
}
