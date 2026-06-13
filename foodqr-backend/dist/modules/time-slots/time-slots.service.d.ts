import { Repository } from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';
export declare class TimeSlotsService {
    private repo;
    constructor(repo: Repository<TimeSlot>);
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
