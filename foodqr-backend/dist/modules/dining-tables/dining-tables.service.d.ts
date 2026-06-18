import { Repository } from 'typeorm';
import { DiningTable } from './entities/dining-table.entity';
import { TableStatus } from '../../common/enums';
export declare class CreateDiningTableDto {
    name: string;
    capacity?: number;
    branchId?: string;
    waiterId?: string;
}
export declare class DiningTablesService {
    private tableRepo;
    constructor(tableRepo: Repository<DiningTable>);
    findAll(branchId?: string): Promise<DiningTable[]>;
    findOne(id: string): Promise<DiningTable>;
    findBySlug(slug: string): Promise<DiningTable>;
    create(dto: CreateDiningTableDto, frontendUrl: string): Promise<DiningTable>;
    update(id: string, dto: Partial<CreateDiningTableDto>): Promise<DiningTable>;
    remove(id: string): Promise<{
        message: string;
    }>;
    regenerateQr(id: string, frontendUrl: string): Promise<DiningTable>;
    updateStatus(id: string, status: TableStatus): Promise<DiningTable>;
    regenerateToken(id: string): Promise<{
        id: string;
        accessToken: string;
        message: string;
    }>;
    exportExcel(branchId: string, res: any): Promise<void>;
}
