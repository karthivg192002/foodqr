import { ItemAttributesService } from './item-attributes.service';
export declare class ItemAttributesController {
    private readonly service;
    constructor(service: ItemAttributesService);
    findAll(): Promise<import("./entities/item-attribute.entity").ItemAttribute[]>;
    listGroupByAttribute(itemId: string): Promise<{
        attributeName: string;
        attributeId: string;
        variations: import("../menu/variations/entities/item-variation.entity").ItemVariation[];
    }[]>;
    getByCategory(categoryId: string): Promise<import("./entities/item-category-attribute.entity").ItemCategoryAttribute[]>;
    assignToCategory(categoryId: string, body: {
        attributeIds: string[];
    }): Promise<import("./entities/item-category-attribute.entity").ItemCategoryAttribute[]>;
    assignToCategoryFlat(body: {
        attributeId: string;
        categoryId: string;
    }): Promise<import("./entities/item-category-attribute.entity").ItemCategoryAttribute[]>;
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
}
