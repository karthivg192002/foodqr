import { ItemAttributesService } from './item-attributes.service';
export declare class ItemAttributesController {
    private readonly service;
    constructor(service: ItemAttributesService);
    findAll(): Promise<import("./entities/item-attribute.entity").ItemAttribute[]>;
    findOne(id: string): Promise<import("./entities/item-attribute.entity").ItemAttribute>;
    create(body: {
        name: string;
        status?: boolean;
    }): Promise<import("./entities/item-attribute.entity").ItemAttribute>;
    update(id: string, body: {
        name?: string;
        status?: boolean;
    }): Promise<import("./entities/item-attribute.entity").ItemAttribute>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getByCategory(categoryId: string): Promise<import("./entities/item-category-attribute.entity").ItemCategoryAttribute[]>;
    assignToCategory(categoryId: string, body: {
        attributeIds: string[];
    }): Promise<import("./entities/item-category-attribute.entity").ItemCategoryAttribute[]>;
}
