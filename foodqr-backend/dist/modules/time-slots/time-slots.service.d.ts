import { Repository } from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class TimeSlotsService {
    private repo;
    constructor(repo: Repository<TimeSlot>, connections: TenantConnectionService);
    findByBranch(branchId: string): Promise<TimeSlot[]>;
    findAll(): Promise<TimeSlot[]>;
    upsertForBranch(branchId: string, slots: {
        day: number;
        openingTime: string;
        closingTime: string;
        isOpen?: boolean;
    }[]): Promise<TimeSlot[]>;
    isWithinSlot(slots: TimeSlot[], date: Date): boolean;
}
