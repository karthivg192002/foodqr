import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-table-track',
  templateUrl: './table-track.component.html',
})
export class TableTrackComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  loading = true;
  private interval: any;

  statusSteps = ['pending', 'accepted', 'preparing', 'prepared', 'delivered'];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.interval = setInterval(() => this.load(), 15000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); }

  load(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.api.get<Order>(`orders/track/${token}`).subscribe({
      next: (o) => { this.order = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  stepIndex(status: string): number { return this.statusSteps.indexOf(status); }

  isCompleted(step: string): boolean {
    if (!this.order) return false;
    return this.stepIndex(this.order.status) >= this.stepIndex(step);
  }

  statusLabel(status: string): string {
    const map: any = {
      pending: 'Order Received',
      accepted: 'Order Accepted',
      preparing: 'Being Prepared',
      prepared: 'Ready',
      delivered: 'Served',
    };
    return map[status] || status;
  }
}
