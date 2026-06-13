import { TableStatus } from '../../../common/enums';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
export declare class DiningTable {
    id: string;
    name: string;
    slug: string;
    capacity: number;
    branchId: string;
    branch: Branch;
    waiterId: string;
    waiter: User;
    qrCode: string;
    qrImageUrl: string;
    status: TableStatus;
    createdAt: Date;
    updatedAt: Date;
}
