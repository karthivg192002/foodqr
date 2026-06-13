import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-customer-track',
  templateUrl: './customer-track.component.html',
})
export class CustomerTrackComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  loading = true;
  private interval: any;

  readonly statusSteps = ['pending', 'accepted', 'preparing', 'prepared', 'out_for_delivery', 'delivered'];
  readonly statusLabels: Record<string, string> = {
    pending: 'Order Placed',
    accepted: 'Accepted',
    preparing: 'Preparing',
    prepared: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
  };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.interval = setInterval(() => this.load(), 20000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); }

  load(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.api.get<Order>(`orders/track/${token}`).subscribe({
      next: (o) => { this.order = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  currentIndex(): number {
    return this.order ? this.statusSteps.indexOf(this.order.status) : -1;
  }

  isCompleted(step: string): boolean { return this.currentIndex() >= this.statusSteps.indexOf(step); }
  isCanceled(): boolean { return this.order?.status === 'canceled' || this.order?.status === 'rejected'; }
}
