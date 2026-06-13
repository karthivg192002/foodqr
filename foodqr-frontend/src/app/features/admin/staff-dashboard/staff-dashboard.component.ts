import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Order, OrderStatus } from '../../../core/models';

interface StaffDashboardData {
  assignedOrders: Order[];
  totalHandled: number;
  pendingCount: number;
  preparingCount: number;
  preparedCount: number;
}

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent implements OnInit, OnDestroy {
  data: StaffDashboardData | null = null;
  loading = true;
  OrderStatus = OrderStatus;
  private interval: any;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
    this.interval = setInterval(() => this.load(), 30000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); }

  load(): void {
    this.api.get<StaffDashboardData>('staff/dashboard').subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this.api.patch(`admin/orders/${orderId}/status`, { status }).subscribe({
      next: () => { this.toastr.success(`Marked as ${status}`); this.load(); },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing',
      prepared: 'Ready', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
    };
    return map[status] || status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 border-yellow-400 text-yellow-800',
      accepted: 'bg-blue-100 border-blue-400 text-blue-800',
      preparing: 'bg-orange-100 border-orange-400 text-orange-800',
      prepared: 'bg-green-100 border-green-400 text-green-800',
    };
    return map[status] || 'bg-gray-100 border-gray-300 text-gray-700';
  }
}
