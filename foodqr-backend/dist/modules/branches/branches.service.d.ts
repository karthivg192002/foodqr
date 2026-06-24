import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { TenantsService } from '../tenants/tenants.service';
export declare class CreateBranchDto {
    name: string;
    slug?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    email?: string;
    latitude?: string;
    longitude?: string;
    image?: string;
    isDefault?: boolean;
    status?: boolean;
}
export declare class BranchesService {
    private branchRepo;
    private connections;
    private tenantsService;
    constructor(branchRepo: Repository<Branch>, connections: TenantConnectionService, tenantsService: TenantsService);
    private get repo();
    findAll(tenantId?: string): Promise<Branch[]>;
    findOne(id: string, tenantId?: string): Promise<Branch>;
    create(dto: CreateBranchDto, tenantId?: string): Promise<Branch>;
    private assertWithinBranchLimit;
    update(id: string, dto: Partial<CreateBranchDto>, tenantId?: string): Promise<Branch>;
    remove(id: string, tenantId?: string): Promise<{
        message: string;
    }>;
    setDefault(id: string, tenantId?: string): Promise<Branch>;
    exportExcel(res: any): Promise<void>;
}
