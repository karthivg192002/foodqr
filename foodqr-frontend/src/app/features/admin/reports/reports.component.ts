import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-reports', templateUrl: './reports.component.html' })
export class ReportsComponent implements OnInit {
  activeTab: 'sales' | 'items' | 'credit' | 'analytics' = 'sales';

  salesData: any[] = [];
  topItems: any[] = [];
  itemsReport: any[] = [];
  revenueByType: any[] = [];
  customerStats: any = null;
  creditReport: any[] = [];
  analyticsData: any = null;

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
    this.api.get<any[]>('admin/reports/items', params).subscribe({ next: (d) => this.itemsReport = d });
    this.api.get<any[]>('admin/reports/revenue-by-type', params).subscribe({ next: (d) => this.revenueByType = d });
    this.api.get<any>('admin/reports/customers').subscribe({ next: (d) => this.customerStats = d });
    this.api.get<any[]>('admin/reports/credit-balance', params).subscribe({ next: (d) => this.creditReport = d });
    this.api.get<any>('admin/reports/analytics', params).subscribe({ next: (d) => this.analyticsData = d });
  }

  getTotalRevenue(): number {
    return this.salesData.reduce((sum, d) => sum + parseFloat(d.revenue || 0), 0);
  }

  getTotalOrders(): number {
    return this.salesData.reduce((sum, d) => sum + parseInt(d.orderCount || 0), 0);
  }

  getTotalItemsSold(): number {
    return this.itemsReport.reduce((sum, d) => sum + parseInt(d.totalQuantity || 0), 0);
  }

  getItemsRevenue(): number {
    return this.itemsReport.reduce((sum, d) => sum + parseFloat(d.totalRevenue || 0), 0);
  }

  exportCsv(type: 'sales' | 'items' | 'credit-balance' | 'customers'): void {
    const params = new URLSearchParams({ startDate: this.startDate, endDate: this.endDate });
    const url = `${environment.apiUrl}/admin/reports/export/${type}?${params.toString()}`;
    window.open(url, '_blank');
  }

  exportExcel(type: 'sales' | 'items' | 'customers'): void {
    const params = new URLSearchParams({ startDate: this.startDate, endDate: this.endDate });
    const url = `${environment.apiUrl}/admin/reports/export/${type}/excel?${params.toString()}`;
    window.open(url, '_blank');
  }

  exportPdf(type: 'sales' | 'items'): void {
    const params = new URLSearchParams({ startDate: this.startDate, endDate: this.endDate });
    const url = `${environment.apiUrl}/admin/reports/export/${type}/pdf?${params.toString()}`;
    window.open(url, '_blank');
  }
}
