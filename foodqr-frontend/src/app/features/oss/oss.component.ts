import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-oss',
  templateUrl: './oss.component.html',
})
export class OssComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  realtimeConnected = false;
  private interval: any;
  private sseSub?: Subscription;

  constructor(private api: ApiService, private realtime: RealtimeService) {}

  ngOnInit(): void {
    this.load();
    // SSE: reload instantly when any order changes
    this.sseSub = this.realtime.listen('admin/oss/stream').subscribe({
      next: () => { this.realtimeConnected = true; this.load(); },
      error: () => { this.realtimeConnected = false; },
    });
    // Keep a lighter fallback poll (30s instead of 8s)
    this.interval = setInterval(() => this.load(), 30000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); this.sseSub?.unsubscribe(); }

  load(): void {
    this.api.get<Order[]>('admin/oss/orders').subscribe({
      next: (orders) => {
        // Sort: pending first, then accepted, preparing, prepared, out_for_delivery
        const priority: Record<string, number> = { pending: 0, accepted: 1, preparing: 2, prepared: 3, out_for_delivery: 4 };
        this.orders = [...orders].sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
      },
      error: () => {},
    });
  }

  get pendingCount(): number { return this.orders.filter((o) => o.status === 'pending').length; }
  get preparingCount(): number { return this.orders.filter((o) => ['accepted', 'preparing'].includes(o.status)).length; }
  get readyCount(): number { return this.orders.filter((o) => o.status === 'prepared').length; }

  statusStyle(status: string): { bg: string; text: string; label: string } {
    const map: any = {
      pending: { bg: 'bg-yellow-400', text: 'text-white', label: 'Order Received' },
      accepted: { bg: 'bg-blue-500', text: 'text-white', label: 'Accepted' },
      preparing: { bg: 'bg-orange-500', text: 'text-white', label: 'Being Prepared' },
      prepared: { bg: 'bg-green-500', text: 'text-white', label: '✅ Ready!' },
      out_for_delivery: { bg: 'bg-purple-500', text: 'text-white', label: 'Out for Delivery' },
    };
    return map[status] || { bg: 'bg-gray-300', text: 'text-gray-700', label: status };
  }
}
