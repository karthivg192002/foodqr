import { ItemExtrasService, CreateItemExtraDto } from './item-extras.service';
export declare class ItemExtrasController {
    private readonly itemExtrasService;
    constructor(itemExtrasService: ItemExtrasService);
    findForFrontend(itemId: string): Promise<import("./entities/item-extra.entity").ItemExtra[]>;
    findForAdmin(itemId: string): Promise<import("./entities/item-extra.entity").ItemExtra[]>;
    create(itemId: string, dto: CreateItemExtraDto): Promise<import("./entities/item-extra.entity").ItemExtra>;
    update(id: string, dto: Partial<CreateItemExtraDto>): Promise<import("./entities/item-extra.entity").ItemExtra>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
