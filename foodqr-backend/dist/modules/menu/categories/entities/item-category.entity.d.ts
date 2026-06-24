import { Branch } from '../../../branches/entities/branch.entity';
export declare class ItemCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    image: string;
    parentCategoryId: string;
    parentCategory: ItemCategory;
    children: ItemCategory[];
    branchId: string;
    branch: Branch;
    status: boolean;
    variationOnly: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
