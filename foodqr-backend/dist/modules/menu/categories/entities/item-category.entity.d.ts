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
    status: boolean;
    variationOnly: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
