import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemVariation } from '../variations/entities/item-variation.entity';
import { ItemType } from '../../../common/enums';
export declare class CreateItemDto {
    name: string;
    description?: string;
    caution?: string;
    ingredients?: string;
    price: number;
    categoryId?: string;
    itemType?: ItemType;
    thumbImage?: string;
    coverImage?: string;
    videoUrl?: string;
    gallery?: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    taxId?: string;
    taxRate?: number;
    isFeatured?: boolean;
    status?: boolean;
    sortOrder?: number;
    variations?: Array<{
        name: string;
        price: number;
        additionalPrice?: number;
        attributeName?: string;
    }>;
}
export declare class ItemsService {
    private itemRepo;
    private variationRepo;
    constructor(itemRepo: Repository<Item>, variationRepo: Repository<ItemVariation>);
    findAll(search?: string, categoryId?: string, isFeatured?: boolean, page?: number, limit?: number): Promise<{
        data: Item[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findAllAdmin(search?: string, categoryId?: string, page?: number, limit?: number): Promise<{
        data: Item[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<Item>;
    getFeatured(): Promise<Item[]>;
    getPopular(): Promise<Item[]>;
    create(dto: CreateItemDto): Promise<Item>;
    update(id: string, dto: Partial<CreateItemDto>): Promise<Item>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleStatus(id: string): Promise<Item>;
    toggleFeatured(id: string): Promise<Item>;
}
