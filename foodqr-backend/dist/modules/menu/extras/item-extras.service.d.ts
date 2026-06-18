import { Repository } from 'typeorm';
import { ItemExtra } from './entities/item-extra.entity';
export declare class CreateItemExtraDto {
    name: string;
    price: number;
    maxQuantity?: number;
    isRequired?: boolean;
    status?: boolean;
}
export declare class ItemExtrasService {
    private extraRepo;
    constructor(extraRepo: Repository<ItemExtra>);
    findByItem(itemId: string): Promise<ItemExtra[]>;
    findByItemAdmin(itemId: string): Promise<ItemExtra[]>;
    create(itemId: string, dto: CreateItemExtraDto): Promise<ItemExtra>;
    update(id: string, dto: Partial<CreateItemExtraDto>): Promise<ItemExtra>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
