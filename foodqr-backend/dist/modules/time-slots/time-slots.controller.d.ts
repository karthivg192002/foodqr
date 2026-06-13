import { TimeSlotsService } from './time-slots.service';
export declare class TimeSlotsController {
    private readonly service;
    constructor(service: TimeSlotsService);
    findAll(): Promise<import("./entities/time-slot.entity").TimeSlot[]>;
    findByBranch(branchId: string): Promise<import("./entities/time-slot.entity").TimeSlot[]>;
    upsert(branchId: string, body: {
        slots: {
            day: number;
            openingTime: string;
            closingTime: string;
            isOpen?: boolean;
        }[];
    }): Promise<import("./entities/time-slot.entity").TimeSlot[]>;
}
