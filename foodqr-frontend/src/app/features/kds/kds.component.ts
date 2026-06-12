import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { Order, OrderStatus } from '../../core/models';

@Component({
  selector: 'app-kds',
  templateUrl: './kds.component.html',
})
export class KdsComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  private interval: any;
  OrderStatus = OrderStatus;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
    this.interval = setInterval(() => this.load(), 10000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); }

  load(): void {
    this.api.get<Order[]>('admin/kds/orders').subscribe({
      next: (orders) => { this.orders = orders; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this.api.patch(`admin/orders/${orderId}/status`, { status }).subscribe({
      next: () => {
        this.toastr.success(`Order updated to ${status}`);
        this.load();
      },
    });
  }

  statusColor(status: string): string {
    const map: any = {
      pending: 'bg-yellow-100 border-yellow-400',
      accepted: 'bg-blue-100 border-blue-400',
      preparing: 'bg-orange-100 border-orange-400',
      prepared: 'bg-green-100 border-green-400',
    };
    return map[status] || 'bg-gray-100 border-gray-300';
  }
}
