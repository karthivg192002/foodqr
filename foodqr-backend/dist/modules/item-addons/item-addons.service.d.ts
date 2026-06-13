import { Repository } from 'typeorm';
import { ItemAddon } from './entities/item-addon.entity';
export declare class ItemAddonsService {
    private repo;
    constructor(repo: Repository<ItemAddon>);
    findByItem(itemId: string): Promise<ItemAddon[]>;
    create(dto: {
        itemId: string;
        addonItemId: string;
        addonItemVariation?: object;
    }): Promise<ItemAddon>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
