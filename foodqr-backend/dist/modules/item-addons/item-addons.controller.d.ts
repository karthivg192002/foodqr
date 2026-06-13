import { ItemAddonsService } from './item-addons.service';
export declare class ItemAddonsController {
    private readonly service;
    constructor(service: ItemAddonsService);
    findByItem(itemId: string): Promise<import("./entities/item-addon.entity").ItemAddon[]>;
    create(body: {
        itemId: string;
        addonItemId: string;
        addonItemVariation?: object;
    }): Promise<import("./entities/item-addon.entity").ItemAddon>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
