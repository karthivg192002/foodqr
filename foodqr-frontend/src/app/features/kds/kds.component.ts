import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { Order, OrderStatus } from '../../core/models';

@Component({
  selector: 'app-kds',
  templateUrl: './kds.component.html',
})
export class KdsComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  realtimeConnected = false;
  private interval: any;
  private sseSub?: Subscription;
  OrderStatus = OrderStatus;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private realtime: RealtimeService,
  ) {}

  ngOnInit(): void {
    this.load();
    // SSE: reload instantly on any order event
    this.sseSub = this.realtime.listen('admin/kds/stream').subscribe({
      next: () => { this.realtimeConnected = true; this.load(); },
      error: () => { this.realtimeConnected = false; },
    });
    // Polling fallback (reduced to 30s since SSE handles instant updates)
    this.interval = setInterval(() => this.load(), 30000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); this.sseSub?.unsubscribe(); }

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
