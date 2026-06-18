import { Response } from 'express';
import { BranchesService, CreateBranchDto } from './branches.service';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    findAll(): Promise<import("./entities/branch.entity").Branch[]>;
    findOne(id: string): Promise<import("./entities/branch.entity").Branch>;
    findAllAdmin(): Promise<import("./entities/branch.entity").Branch[]>;
    create(dto: CreateBranchDto): Promise<import("./entities/branch.entity").Branch>;
    update(id: string, dto: Partial<CreateBranchDto>): Promise<import("./entities/branch.entity").Branch>;
    setDefault(id: string): Promise<import("./entities/branch.entity").Branch>;
    remove(id: string): Promise<{
        message: string;
    }>;
    exportExcel(res: Response): Promise<void>;
}
