import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
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

  // Delivery boy assignment
  deliveryBoys: any[] = [];
  showAssignModal = false;
  assignOrderId = '';
  selectedDeliveryBoyId = '';

  constructor(private api: ApiService, private toastr: ToastrService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadOrders();
    if (!this.auth.isWaiter) {
      this.loadDeliveryBoys();
    }
  }

  loadDeliveryBoys(): void {
    this.api.get<any>('admin/staff', { role: 'delivery_boy' }).subscribe({
      next: (res) => { this.deliveryBoys = res.data || res || []; },
    });
  }

  loadOrders(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterType) params.orderType = this.filterType;
    if (this.search) params.search = this.search;

    this.api.getPaginated<PaginatedResponse<Order>>('admin/orders', params).subscribe({
      next: (res) => { this.orders = res.data ?? []; this.total = res.total ?? 0; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  updateStatus(order: Order, status: string): void {
    this.api.patch(`admin/orders/${order.id}/status`, { status }).subscribe({
      next: () => { this.toastr.success('Order status updated'); this.loadOrders(); this.selectedOrder = null; },
    });
  }

  openAssignModal(order: Order): void {
    this.assignOrderId = order.id;
    this.selectedDeliveryBoyId = (order as any).deliveryBoyId || '';
    this.showAssignModal = true;
  }

  assignDeliveryBoy(): void {
    if (!this.selectedDeliveryBoyId) return;
    this.api.patch(`admin/orders/${this.assignOrderId}/assign-delivery-boy`, { deliveryBoyId: this.selectedDeliveryBoyId }).subscribe({
      next: () => { this.toastr.success('Delivery boy assigned'); this.showAssignModal = false; this.loadOrders(); },
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
