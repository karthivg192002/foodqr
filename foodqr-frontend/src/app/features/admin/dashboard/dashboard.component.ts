import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats } from '../../../core/models';

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  topItems: any[] = [];
  recentOrders: any[] = [];
  salesByType: any[] = [];
  loading = true;
  today = new Date();

  private maxRevenue = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    this.api.get<DashboardStats>('admin/reports/dashboard').subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
    this.api.get<any[]>('admin/reports/top-items', { limit: 5 }).subscribe({
      next: (items) => { this.topItems = items || []; },
    });
    this.api.get<any>('admin/orders', { limit: 5, page: 1 }).subscribe({
      next: (res) => { this.recentOrders = res?.data || []; },
    });
    this.api.get<any[]>('admin/reports/revenue-by-type').subscribe({
      next: (data) => {
        this.salesByType = data || [];
        this.maxRevenue = Math.max(...this.salesByType.map((d) => +d.revenue || 0), 1);
      },
    });
  }

  getOrderStatusBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning', accepted: 'badge-info', preparing: 'badge-info',
      prepared: 'badge-info', out_for_delivery: 'badge-info', delivered: 'badge-success',
      canceled: 'badge-danger', rejected: 'badge-danger',
    };
    return map[status] || 'badge-gray';
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      delivery: 'bg-orange-500', takeaway: 'bg-blue-500',
      dining_table: 'bg-purple-500', pos: 'bg-emerald-500',
    };
    return map[type] || 'bg-gray-400';
  }

  getTypePercent(total: number): number {
    return this.maxRevenue ? Math.round((+total / this.maxRevenue) * 100) : 0;
  }
}
