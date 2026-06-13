import { ItemsService, CreateItemDto } from './items.service';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    findAll(search?: string, categoryId?: string, page?: number, limit?: number): Promise<{
        data: import("./entities/item.entity").Item[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getFeatured(): Promise<import("./entities/item.entity").Item[]>;
    getPopular(): Promise<import("./entities/item.entity").Item[]>;
    findOne(id: string): Promise<import("./entities/item.entity").Item>;
    findAllAdmin(search?: string, categoryId?: string, page?: number, limit?: number): Promise<{
        data: import("./entities/item.entity").Item[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    create(dto: CreateItemDto): Promise<import("./entities/item.entity").Item>;
    update(id: string, dto: Partial<CreateItemDto>): Promise<import("./entities/item.entity").Item>;
    toggleStatus(id: string): Promise<import("./entities/item.entity").Item>;
    toggleFeatured(id: string): Promise<import("./entities/item.entity").Item>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
