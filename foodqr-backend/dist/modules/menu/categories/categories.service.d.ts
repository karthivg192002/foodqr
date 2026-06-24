import { Repository } from 'typeorm';
import { ItemCategory } from './entities/item-category.entity';
import { TenantConnectionService } from '../../tenants/connection/tenant-connection.service';
export declare class CreateCategoryDto {
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    parentCategoryId?: string;
    branchId?: string;
    status?: boolean;
    variationOnly?: boolean;
    sortOrder?: number;
}
export declare class CategoriesService {
    private catRepo;
    constructor(catRepo: Repository<ItemCategory>, connections: TenantConnectionService);
    findAll(includeChildren?: boolean, branchId?: string): Promise<ItemCategory[]>;
    findAllFlat(branchId?: string): Promise<ItemCategory[]>;
    findOne(id: string): Promise<ItemCategory>;
    create(dto: CreateCategoryDto): Promise<ItemCategory>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<ItemCategory>;
    remove(id: string): Promise<{
        message: string;
    }>;
    updateSortOrder(items: Array<{
        id: string;
        sortOrder: number;
    }>): Promise<{
        message: string;
    }>;
    exportExcel(res: any): Promise<void>;
    importFromCsv(csvContent: string): Promise<{
        imported: number;
        errors: string[];
    }>;
}
