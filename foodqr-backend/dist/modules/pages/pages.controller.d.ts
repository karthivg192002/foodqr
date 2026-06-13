import { PagesService } from './pages.service';
export declare class PagesController {
    private readonly service;
    constructor(service: PagesService);
    findAll(): Promise<import("./entities/page.entity").Page[]>;
    findBySlug(slug: string): Promise<import("./entities/page.entity").Page>;
    findOne(id: string): Promise<import("./entities/page.entity").Page>;
    create(body: any): Promise<import("./entities/page.entity").Page>;
    update(id: string, body: any): Promise<import("./entities/page.entity").Page>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
