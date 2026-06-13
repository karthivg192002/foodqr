import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
export declare class CreateBranchDto {
    name: string;
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
}
export declare class BranchesService {
    private branchRepo;
    constructor(branchRepo: Repository<Branch>);
    findAll(): Promise<Branch[]>;
    findOne(id: string): Promise<Branch>;
    create(dto: CreateBranchDto): Promise<Branch>;
    update(id: string, dto: Partial<CreateBranchDto>): Promise<Branch>;
    remove(id: string): Promise<{
        message: string;
    }>;
    setDefault(id: string): Promise<Branch>;
}
