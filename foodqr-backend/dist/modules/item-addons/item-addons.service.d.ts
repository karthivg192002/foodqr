import { Repository } from 'typeorm';
import { ItemAddon } from './entities/item-addon.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class ItemAddonsService {
    private repo;
    constructor(repo: Repository<ItemAddon>, connections: TenantConnectionService);
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
