import { Repository } from 'typeorm';
import { ItemAttribute } from './entities/item-attribute.entity';
import { ItemCategoryAttribute } from './entities/item-category-attribute.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
export declare class ItemAttributesService {
    private attrRepo;
    private pivotRepo;
    private variationRepo;
    constructor(attrRepo: Repository<ItemAttribute>, pivotRepo: Repository<ItemCategoryAttribute>, variationRepo: Repository<ItemVariation>);
    findAll(): Promise<ItemAttribute[]>;
    findOne(id: string): Promise<ItemAttribute>;
    create(dto: {
        name: string;
        status?: boolean;
    }): Promise<ItemAttribute>;
    update(id: string, dto: {
        name?: string;
        status?: boolean;
    }): Promise<ItemAttribute>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getByCategory(categoryId: string): Promise<ItemCategoryAttribute[]>;
    assignToCategory(categoryId: string, attributeIds: string[]): Promise<ItemCategoryAttribute[]>;
    listGroupByAttribute(itemId: string): Promise<{
        attributeName: string;
        attributeId: string;
        variations: ItemVariation[];
    }[]>;
}
