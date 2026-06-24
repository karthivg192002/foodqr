import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemVariation } from '../variations/entities/item-variation.entity';
import { ItemCategory } from '../categories/entities/item-category.entity';
import { ItemType } from '../../../common/enums';
import { TenantConnectionService } from '../../tenants/connection/tenant-connection.service';
export declare class CreateItemDto {
    name: string;
    description?: string;
    caution?: string;
    ingredients?: string;
    price: number;
    categoryId?: string;
    subCategoryId?: string;
    branchId?: string;
    itemType?: ItemType;
    thumbImage?: string;
    coverImage?: string;
    videoUrl?: string;
    arImage?: string;
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
    private catRepo;
    constructor(itemRepo: Repository<Item>, variationRepo: Repository<ItemVariation>, catRepo: Repository<ItemCategory>, connections: TenantConnectionService);
    private resolveCategoryIds;
    findAll(search?: string, categoryId?: string, isFeatured?: boolean, page?: number, limit?: number, branchId?: string): Promise<{
        data: Item[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findAllAdmin(search?: string, categoryId?: string, page?: number, limit?: number, branchId?: string): Promise<{
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
    restore(id: string): Promise<Item>;
    exportExcel(res: any): Promise<void>;
    importFromCsv(csvContent: string): Promise<{
        imported: number;
        errors: string[];
    }>;
    findAllWithDeleted(search?: string, categoryId?: string, page?: number, limit?: number): Promise<{
        data: Item[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    toggleStatus(id: string): Promise<Item>;
    toggleFeatured(id: string): Promise<Item>;
}
