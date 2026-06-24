import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class PagesService {
    private repo;
    constructor(repo: Repository<Page>, connections: TenantConnectionService);
    findAll(): Promise<Page[]>;
    findBySlug(slug: string): Promise<Page>;
    findOne(id: string): Promise<Page>;
    create(dto: Partial<Page>): Promise<Page>;
    update(id: string, dto: Partial<Page>): Promise<Page>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
