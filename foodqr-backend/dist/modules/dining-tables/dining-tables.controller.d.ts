import { ConfigService } from '@nestjs/config';
import { DiningTablesService, CreateDiningTableDto } from './dining-tables.service';
import { TableStatus } from '../../common/enums';
export declare class DiningTablesController {
    private readonly diningTablesService;
    private readonly configService;
    constructor(diningTablesService: DiningTablesService, configService: ConfigService);
    findAll(branchId?: string): Promise<import("./entities/dining-table.entity").DiningTable[]>;
    findBySlug(slug: string): Promise<import("./entities/dining-table.entity").DiningTable>;
    findAllAdmin(branchId?: string): Promise<import("./entities/dining-table.entity").DiningTable[]>;
    create(dto: CreateDiningTableDto): Promise<import("./entities/dining-table.entity").DiningTable>;
    update(id: string, dto: Partial<CreateDiningTableDto>): Promise<import("./entities/dining-table.entity").DiningTable>;
    regenerateQr(id: string): Promise<import("./entities/dining-table.entity").DiningTable>;
    updateStatus(id: string, status: TableStatus): Promise<import("./entities/dining-table.entity").DiningTable>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
