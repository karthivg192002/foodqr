import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Order, OrderStatus, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  total = 0;
  page = 1;
  limit = 20;
  loading = false;
  selectedOrder: Order | null = null;
  filterStatus = '';
  filterType = '';
  search = '';
  statuses = Object.values(OrderStatus);
  orderTypes = ['delivery', 'takeaway', 'pos', 'dining_table'];

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterType) params.orderType = this.filterType;
    if (this.search) params.search = this.search;

    this.api.get<PaginatedResponse<Order>>('admin/orders', params).subscribe({
      next: (res) => { this.orders = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  updateStatus(order: Order, status: string): void {
    this.api.patch(`admin/orders/${order.id}/status`, { status }).subscribe({
      next: () => { this.toastr.success('Order status updated'); this.loadOrders(); this.selectedOrder = null; },
    });
  }

  getNextStatuses(current: string): string[] {
    const flow: Record<string, string[]> = {
      pending: ['accepted', 'rejected'],
      accepted: ['preparing', 'canceled'],
      preparing: ['prepared'],
      prepared: ['out_for_delivery', 'delivered'],
      out_for_delivery: ['delivered'],
    };
    return flow[current] || [];
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning', accepted: 'badge-info', preparing: 'badge-info',
      prepared: 'badge-info', out_for_delivery: 'badge-info', delivered: 'badge-success',
      canceled: 'badge-danger', rejected: 'badge-danger',
    };
    return map[status] || 'badge-gray';
  }

  get pages(): number { return Math.ceil(this.total / this.limit); }
}
