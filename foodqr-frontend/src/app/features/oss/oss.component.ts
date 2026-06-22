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
  currentTime = new Date();

  private interval: any;
  private clockInterval: any;
  private sseSub?: Subscription;

  constructor(private api: ApiService, private realtime: RealtimeService) {}

  ngOnInit(): void {
    this.load();
    this.sseSub = this.realtime.listen('admin/oss/stream').subscribe({
      next: () => { this.realtimeConnected = true; this.load(); },
      error: () => { this.realtimeConnected = false; },
    });
    this.interval = setInterval(() => this.load(), 30000);
    this.clockInterval = setInterval(() => { this.currentTime = new Date(); }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.clockInterval);
    this.sseSub?.unsubscribe();
  }

  load(): void {
    this.api.get<Order[]>('admin/oss/orders').subscribe({
      next: (orders) => {
        const priority: Record<string, number> = { pending: 0, accepted: 1, preparing: 2, prepared: 3, out_for_delivery: 4 };
        this.orders = [...orders].sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
      },
      error: () => {},
    });
  }

  get pendingCount(): number { return this.orders.filter((o) => o.status === 'pending').length; }
  get preparingCount(): number { return this.orders.filter((o) => ['accepted', 'preparing'].includes(o.status)).length; }
  get readyCount(): number { return this.orders.filter((o) => o.status === 'prepared').length; }

  get preparingOrders(): Order[] {
    return this.orders.filter((o) => ['accepted', 'preparing'].includes(o.status));
  }

  get readyOrders(): Order[] {
    return this.orders.filter((o) => o.status === 'prepared' || o.status === 'out_for_delivery');
  }

  get aggregatedItems(): { name: string; total: number; rank: number }[] {
    const map = new Map<string, number>();
    for (const order of this.orders) {
      for (const item of (order.items as any[]) ?? []) {
        const key = item.itemName as string;
        map.set(key, (map.get(key) ?? 0) + (item.quantity ?? 1));
      }
    }
    return Array.from(map.entries())
      .map(([name, total], i) => ({ name, total, rank: i + 1 }))
      .sort((a, b) => b.total - a.total)
      .map((item, i) => ({ ...item, rank: i + 1 }))
      .slice(0, 12);
  }

  itemColor(index: number): string {
    const colors = [
      'linear-gradient(135deg,#f97316,#ea580c)',
      'linear-gradient(135deg,#8b5cf6,#7c3aed)',
      'linear-gradient(135deg,#06b6d4,#0891b2)',
      'linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#ec4899,#db2777)',
    ];
    return colors[index % colors.length];
  }

  orderTypeLabel(type: string): string {
    const map: Record<string, string> = {
      dining_table: 'Dine In',
      takeaway: 'Takeaway',
      delivery: 'Delivery',
      pos: 'POS',
    };
    return map[type] ?? type;
  }
}
