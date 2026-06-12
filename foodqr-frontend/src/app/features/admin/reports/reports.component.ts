import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-reports', templateUrl: './reports.component.html' })
export class ReportsComponent implements OnInit {
  salesData: any[] = [];
  topItems: any[] = [];
  revenueByType: any[] = [];
  customerStats: any = null;
  startDate = new Date(new Date().setDate(1)).toISOString().split('T')[0];
  endDate = new Date().toISOString().split('T')[0];
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    const params = { startDate: this.startDate, endDate: this.endDate };

    this.api.get<any[]>('admin/reports/sales', params).subscribe({ next: (d) => { this.salesData = d; this.loading = false; } });
    this.api.get<any[]>('admin/reports/top-items', { ...params, limit: 10 }).subscribe({ next: (d) => this.topItems = d });
    this.api.get<any[]>('admin/reports/revenue-by-type', params).subscribe({ next: (d) => this.revenueByType = d });
    this.api.get<any>('admin/reports/customers').subscribe({ next: (d) => this.customerStats = d });
  }

  getTotalRevenue(): number {
    return this.salesData.reduce((sum, d) => sum + parseFloat(d.revenue || 0), 0);
  }

  getTotalOrders(): number {
    return this.salesData.reduce((sum, d) => sum + parseInt(d.orderCount || 0), 0);
  }
}
