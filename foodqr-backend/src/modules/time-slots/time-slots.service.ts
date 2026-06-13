import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';

@Injectable()
export class TimeSlotsService {
  constructor(@InjectRepository(TimeSlot) private repo: Repository<TimeSlot>) {}

  findByBranch(branchId: string) {
    return this.repo.find({ where: { branchId }, order: { day: 'ASC' } });
  }

  findAll() {
    return this.repo.find({ order: { day: 'ASC' } });
  }

  async upsertForBranch(branchId: string, slots: { day: number; openingTime: string; closingTime: string; isOpen?: boolean }[]) {
    await this.repo.delete({ branchId });
    const rows = slots.map((s) => this.repo.create({ ...s, branchId }));
    return this.repo.save(rows);
  }

  isWithinSlot(slots: TimeSlot[], date: Date): boolean {
    const day = date.getDay();
    const slot = slots.find((s) => s.day === day && s.isOpen);
    if (!slot) return false;
    const [oh, om] = slot.openingTime.split(':').map(Number);
    const [ch, cm] = slot.closingTime.split(':').map(Number);
    const mins = date.getHours() * 60 + date.getMinutes();
    return mins >= oh * 60 + om && mins <= ch * 60 + cm;
  }
}
