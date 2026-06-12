import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-oss',
  templateUrl: './oss.component.html',
})
export class OssComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  private interval: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.interval = setInterval(() => this.load(), 8000);
  }

  ngOnDestroy(): void { clearInterval(this.interval); }

  load(): void {
    this.api.get<Order[]>('admin/oss/orders').subscribe({
      next: (orders) => this.orders = orders,
    });
  }

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
