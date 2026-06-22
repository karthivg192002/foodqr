import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { Order, OrderStatus, OrderType } from '../../core/models';

@Component({
  selector: 'app-kds',
  templateUrl: './kds.component.html',
})
export class KdsComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  realtimeConnected = false;
  now = new Date();

  activeTab: 'items-board' | 'today-orders' = 'items-board';
  activeFilter: 'all' | 'confirmed' | 'preparing' | 'done' = 'all';
  searchQuery = '';

  private interval: any;
  private clockInterval: any;
  private sseSub?: Subscription;
  OrderStatus = OrderStatus;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private realtime: RealtimeService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.sseSub = this.realtime.listen('admin/kds/stream').subscribe({
      next: () => { this.realtimeConnected = true; this.load(); },
      error: () => { this.realtimeConnected = false; },
    });
    this.interval = setInterval(() => this.load(), 30000);
    this.clockInterval = setInterval(() => { this.now = new Date(); }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.clockInterval);
    this.sseSub?.unsubscribe();
  }

  load(): void {
    this.api.get<Order[]>('admin/kds/orders').subscribe({
      next: (orders) => { this.orders = orders; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this.api.patch(`admin/orders/${orderId}/status`, { status }).subscribe({
      next: () => { this.toastr.success(`Order updated`); this.load(); },
    });
  }

  // ─── Elapsed time ────────────────────────────────
  elapsedMinutes(createdAt: string): number {
    return Math.floor((this.now.getTime() - new Date(createdAt).getTime()) / 60000);
  }

  elapsedLabel(createdAt: string): string {
    const m = this.elapsedMinutes(createdAt);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h}h ${rem}m` : `${h}h`;
  }

  elapsedColor(createdAt: string): string {
    const m = this.elapsedMinutes(createdAt);
    if (m >= 20) return '#ef4444';
    if (m >= 10) return '#f59e0b';
    return '#22c55e';
  }

  // ─── Status helpers ────────────────────────────────
  statusBorder(status: string): string {
    const m: Record<string, string> = {
      pending: '#f59e0b', accepted: '#3b82f6', preparing: '#f97316', prepared: '#22c55e',
    };
    return m[status] || '#475569';
  }

  statusGlow(status: string): string {
    const m: Record<string, string> = {
      pending:   '0 0 0 1px rgba(245,158,11,0.12), 0 4px 24px rgba(245,158,11,0.07)',
      accepted:  '0 0 0 1px rgba(59,130,246,0.12), 0 4px 24px rgba(59,130,246,0.07)',
      preparing: '0 0 0 1px rgba(249,115,22,0.12), 0 4px 24px rgba(249,115,22,0.07)',
      prepared:  '0 0 0 1px rgba(34,197,94,0.12), 0 4px 24px rgba(34,197,94,0.07)',
    };
    return m[status] || '0 4px 16px rgba(0,0,0,0.20)';
  }

  statusChipStyle(status: string): string {
    const m: Record<string, string> = {
      pending:   'background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.28)',
      accepted:  'background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.28)',
      preparing: 'background:rgba(249,115,22,0.15);color:#fb923c;border:1px solid rgba(249,115,22,0.28)',
      prepared:  'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.28)',
    };
    return m[status] || 'background:rgba(100,116,139,0.12);color:#94a3b8;border:1px solid rgba(100,116,139,0.20)';
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      pending: 'Pending', accepted: 'Confirmed', preparing: 'Preparing', prepared: 'Ready',
    };
    return m[status] || status;
  }

  tokenColor(status: string): string {
    const m: Record<string, string> = {
      pending: '#fbbf24', accepted: '#60a5fa', preparing: '#fb923c', prepared: '#4ade80',
    };
    return m[status] || '#94a3b8';
  }

  orderTypeLabel(type: string): string {
    const m: Record<string, string> = { dining_table: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery', pos: 'POS' };
    return m[type] ?? type;
  }

  // ─── Filtered lists ──────────────────────────────
  get filteredOrders(): Order[] {
    let list = this.orders;
    if (this.activeFilter === 'confirmed') list = list.filter((o) => o.status === 'accepted');
    else if (this.activeFilter === 'preparing') list = list.filter((o) => o.status === 'preparing');
    else if (this.activeFilter === 'done') list = list.filter((o) => o.status === 'prepared');
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter((o) =>
        String(o.orderSerialNo).toLowerCase().includes(q) ||
        (o.items as any[])?.some((i) => i.itemName?.toLowerCase().includes(q)),
      );
    }
    return list;
  }

  get dineInOrders(): Order[] {
    return this.filteredOrders.filter((o) => o.orderType === OrderType.DINING_TABLE);
  }

  get takeawayOrders(): Order[] {
    return this.filteredOrders.filter((o) => o.orderType !== OrderType.DINING_TABLE);
  }

  get pendingCount(): number { return this.orders.filter((o) => o.status === 'pending').length; }
  get confirmedCount(): number { return this.orders.filter((o) => o.status === 'accepted').length; }
  get preparingCount(): number { return this.orders.filter((o) => o.status === 'preparing').length; }
  get readyCount(): number { return this.orders.filter((o) => o.status === 'prepared').length; }

  get aggregatedItems(): { name: string; total: number; orders: number }[] {
    const map = new Map<string, { total: number; orders: Set<string> }>();
    for (const order of this.orders) {
      for (const item of (order.items as any[]) ?? []) {
        const key = item.itemName as string;
        if (!map.has(key)) map.set(key, { total: 0, orders: new Set() });
        const entry = map.get(key)!;
        entry.total += item.quantity ?? 1;
        entry.orders.add(order.id);
      }
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, total: v.total, orders: v.orders.size }))
      .sort((a, b) => b.total - a.total);
  }
}
