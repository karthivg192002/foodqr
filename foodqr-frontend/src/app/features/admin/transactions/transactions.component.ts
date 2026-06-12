import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Transaction } from '../../../core/models';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  filtered: any[] = [];
  loading = false;

  // Filters
  filterStatus = '';
  filterMethod = '';
  filterDateFrom = '';
  filterDateTo = '';

  statusOptions = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
  methodOptions = ['cash', 'card', 'stripe', 'paypal', 'razorpay', 'wallet'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    let url = 'admin/transactions?limit=200';
    if (this.filterDateFrom) url += `&from=${this.filterDateFrom}`;
    if (this.filterDateTo) url += `&to=${this.filterDateTo}`;

    this.api.get<any>(url).subscribe({
      next: (res) => {
        this.transactions = Array.isArray(res) ? res : (res.data ?? []);
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  applyFilters(): void {
    this.filtered = this.transactions.filter((t) => {
      if (this.filterStatus && t.status !== this.filterStatus) return false;
      if (this.filterMethod && t.paymentMethod !== this.filterMethod) return false;
      return true;
    });
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filterMethod = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.applyFilters();
  }

  exportTransactions(): void {
    console.log('Export transactions:', this.filtered);
  }

  shortId(id: string): string {
    return id ? '#' + id.slice(-8).toUpperCase() : '-';
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'failed': case 'cancelled': return 'badge-danger';
      case 'refunded': return 'badge-info';
      default: return 'badge-gray';
    }
  }

  get totalAmount(): number {
    return this.filtered.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount ?? 0), 0);
  }

  get failedCount(): number {
    return this.filtered.filter(t => t.status === 'failed' || t.status === 'cancelled').length;
  }
}
