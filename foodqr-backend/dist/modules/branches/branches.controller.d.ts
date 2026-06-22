import { Response } from 'express';
import { BranchesService, CreateBranchDto } from './branches.service';
import { User } from '../users/entities/user.entity';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    findAll(): Promise<import("./entities/branch.entity").Branch[]>;
    findOne(id: string): Promise<import("./entities/branch.entity").Branch>;
    findAllAdmin(user: User): Promise<import("./entities/branch.entity").Branch[]>;
    create(dto: CreateBranchDto, user: User): Promise<import("./entities/branch.entity").Branch>;
    update(id: string, dto: Partial<CreateBranchDto>, user: User): Promise<import("./entities/branch.entity").Branch>;
    setDefault(id: string, user: User): Promise<import("./entities/branch.entity").Branch>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    exportExcel(res: Response): Promise<void>;
}
