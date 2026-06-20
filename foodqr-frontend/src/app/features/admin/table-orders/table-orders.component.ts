import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Order, OrderStatus, PaginatedResponse } from '../../../core/models';

interface TableGroup {
  tableId: string;
  tableName: string;
  orders: Order[];
}

const ACTIVE_STATUSES = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.PREPARED];

@Component({
  selector: 'app-table-orders',
  templateUrl: './table-orders.component.html',
})
export class TableOrdersComponent implements OnInit {
  loading = false;
  showAllStatuses = false;
  groups: TableGroup[] = [];
  OrderStatus = OrderStatus;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getPaginated<PaginatedResponse<Order>>('admin/orders', { orderType: 'dining_table', limit: 200 }).subscribe({
      next: (res) => {
        const orders = (res.data ?? []).filter(
          (o) => this.showAllStatuses || ACTIVE_STATUSES.includes(o.status as OrderStatus),
        );
        this.groups = this.groupByTable(orders);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private groupByTable(orders: Order[]): TableGroup[] {
    const map = new Map<string, TableGroup>();
    for (const order of orders) {
      const table = (order as any).diningTable;
      const tableId = table?.id || 'unassigned';
      const tableName = table?.name || 'Unassigned Table';
      if (!map.has(tableId)) {
        map.set(tableId, { tableId, tableName, orders: [] });
      }
      map.get(tableId)!.orders.push(order);
    }
    return Array.from(map.values()).sort((a, b) => a.tableName.localeCompare(b.tableName));
  }

  updateStatus(order: Order, status: string): void {
    this.api.patch(`admin/orders/${order.id}/status`, { status }).subscribe({
      next: () => { this.toastr.success('Order status updated'); this.load(); },
    });
  }

  getNextStatuses(current: string): string[] {
    const flow: Record<string, string[]> = {
      pending: ['accepted', 'rejected'],
      accepted: ['preparing', 'canceled'],
      preparing: ['prepared'],
      prepared: ['delivered'],
    };
    return flow[current] || [];
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning', accepted: 'badge-info', preparing: 'badge-info',
      prepared: 'badge-info', delivered: 'badge-success',
      canceled: 'badge-danger', rejected: 'badge-danger',
    };
    return map[status] || 'badge-gray';
  }
}
