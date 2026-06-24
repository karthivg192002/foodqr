import { Response } from 'express';
import { CategoriesService, CreateCategoryDto } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(branchId?: string): Promise<import("./entities/item-category.entity").ItemCategory[]>;
    findOne(id: string): Promise<import("./entities/item-category.entity").ItemCategory>;
    findAllAdmin(branchId?: string): Promise<import("./entities/item-category.entity").ItemCategory[]>;
    create(dto: CreateCategoryDto): Promise<import("./entities/item-category.entity").ItemCategory>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<import("./entities/item-category.entity").ItemCategory>;
    getPosCategories(): Promise<import("./entities/item-category.entity").ItemCategory[]>;
    getPosSubCategories(id: string): Promise<import("./entities/item-category.entity").ItemCategory[]>;
    updateSortOrder(items: Array<{
        id: string;
        sortOrder: number;
    }>): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    exportExcel(res: Response): Promise<void>;
    downloadSample(res: Response): void;
    importCsv(file: Express.Multer.File): Promise<{
        imported: number;
        errors: string[];
    }>;
}
