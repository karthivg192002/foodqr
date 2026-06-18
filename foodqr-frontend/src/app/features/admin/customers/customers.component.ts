import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User, PaginatedResponse } from '../../../core/models';

@Component({ selector: 'app-customers', templateUrl: './customers.component.html' })
export class CustomersComponent implements OnInit {
  customers: User[] = [];
  customerStamps: Record<string, number> = {};
  total = 0;
  page = 1;
  loading = false;
  search = '';

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getPaginated<PaginatedResponse<User>>('admin/customers', { page: this.page, limit: 20, search: this.search }).subscribe({
      next: (res) => { this.customers = res.data ?? []; this.total = res.total ?? 0; this.loading = false; },
      error: () => { this.loading = false; },
    });
    this.api.get<any>('admin/loyalty/segments').subscribe({
      next: (segments: any[]) => {
        if (Array.isArray(segments)) {
          for (const seg of segments) {
            this.customerStamps[seg.userId || seg.id] = seg.totalStamps || 0;
          }
        }
      },
    });
  }

  loyaltyTier(customerId: string): { label: string; class: string } {
    const stamps = this.customerStamps[customerId] || 0;
    if (stamps >= 30) return { label: 'Gold', class: 'bg-yellow-100 text-yellow-700' };
    if (stamps >= 15) return { label: 'Silver', class: 'bg-gray-100 text-gray-600' };
    if (stamps >= 5) return { label: 'Bronze', class: 'bg-orange-100 text-orange-700' };
    return { label: '', class: '' };
  }

  get pages(): number { return Math.ceil(this.total / 20); }
}
