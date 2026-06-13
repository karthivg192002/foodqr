import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

interface TimeSlot { day: number; openingTime: string; closingTime: string; isOpen: boolean; }

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({ selector: 'app-time-slots', templateUrl: './time-slots.component.html' })
export class TimeSlotsComponent implements OnInit {
  branches: any[] = [];
  selectedBranchId = '';
  slots: TimeSlot[] = [];
  loading = false;
  saving = false;
  dayNames = DAY_NAMES;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.api.get<any[]>('admin/branches').subscribe({ next: (b) => { this.branches = b; if (b.length) { this.selectedBranchId = b[0].id; this.loadSlots(); } } });
  }

  loadSlots(): void {
    if (!this.selectedBranchId) return;
    this.loading = true;
    this.api.get<TimeSlot[]>(`admin/time-slots/branch/${this.selectedBranchId}`).subscribe({
      next: (data) => {
        // Ensure all 7 days are present
        const slotMap: Record<number, TimeSlot> = {};
        data.forEach((s) => slotMap[s.day] = s);
        this.slots = Array.from({ length: 7 }, (_, i) => slotMap[i] || { day: i, openingTime: '09:00', closingTime: '22:00', isOpen: true });
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  save(): void {
    this.saving = true;
    this.api.post(`admin/time-slots/branch/${this.selectedBranchId}`, { slots: this.slots }).subscribe({
      next: () => { this.toastr.success('Time slots saved'); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  onBranchChange(): void { this.loadSlots(); }
}
