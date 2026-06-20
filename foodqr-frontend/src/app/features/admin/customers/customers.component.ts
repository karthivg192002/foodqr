import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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

  // Detail drawer
  selected: User | null = null;
  detailTab: 'profile' | 'addresses' | 'orders' = 'profile';
  addresses: any[] = [];
  orders: any[] = [];
  detailLoading = false;
  uploadingImage = false;

  constructor(private api: ApiService, private toastr: ToastrService) {}
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

  openDetail(customer: User): void {
    this.selected = customer;
    this.detailTab = 'profile';
    this.addresses = [];
    this.orders = [];
  }

  closeDetail(): void {
    this.selected = null;
  }

  onDetailTabChange(tab: 'profile' | 'addresses' | 'orders'): void {
    this.detailTab = tab;
    if (!this.selected) return;
    if (tab === 'addresses' && !this.addresses.length) {
      this.detailLoading = true;
      this.api.get<any[]>(`admin/customers/${this.selected.id}/addresses`).subscribe({
        next: (res) => { this.addresses = res || []; this.detailLoading = false; },
        error: () => { this.detailLoading = false; },
      });
    }
    if (tab === 'orders' && !this.orders.length) {
      this.detailLoading = true;
      this.api.get<any>(`admin/customers/${this.selected.id}/orders`).subscribe({
        next: (res) => { this.orders = res?.data || res || []; this.detailLoading = false; },
        error: () => { this.detailLoading = false; },
      });
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.selected) return;
    this.uploadingImage = true;
    this.api.upload('upload/image', file).subscribe({
      next: (res) => {
        this.api.patch(`admin/users/${this.selected!.id}/image`, { profileImage: res.url }).subscribe({
          next: () => {
            this.selected!.profileImage = res.url;
            this.uploadingImage = false;
            this.toastr.success('Profile image updated');
          },
          error: () => { this.uploadingImage = false; },
        });
      },
      error: () => { this.uploadingImage = false; this.toastr.error('Upload failed'); },
    });
  }
}
