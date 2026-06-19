import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-customer-orders',
  templateUrl: './customer-orders.component.html',
})
export class CustomerOrdersComponent implements OnInit {
  orders: Order[] = [];
  selected: Order | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<any>('orders/my-orders').subscribe({
      next: (res) => { this.orders = Array.isArray(res) ? res : (res.data ?? []); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  trackOrder(order: Order): void {
    this.api.get<Order>(`orders/track/${order.token}`).subscribe({
      next: (o) => this.selected = o,
    });
  }

  private readonly STATUS_STEPS = ['pending', 'accepted', 'preparing', 'prepared', 'out_for_delivery', 'delivered'];

  getStepIndex(status: string): number {
    return this.STATUS_STEPS.indexOf(status);
  }

  statusClass(status: string): string {
    const map: any = {
      pending: 'badge-warning',
      accepted: 'badge-info',
      preparing: 'badge-info',
      prepared: 'badge-success',
      out_for_delivery: 'badge-info',
      delivered: 'badge-success',
      canceled: 'badge-danger',
      rejected: 'badge-danger',
    };
    return map[status] || 'badge-gray';
  }

  paymentLabel(value?: string | null): string {
    const labels: Record<string, string> = {
      cash_on_delivery: 'Cash on Delivery',
      e_wallet: 'Wallet Balance',
      paypal: 'PayPal',
      razorpay: 'Razorpay',
      cashfree: 'Cashfree',
      mollie: 'Mollie',
      flutterwave: 'Flutterwave',
      paystack: 'Paystack',
      phonepe: 'PhonePe',
      paytm: 'Paytm',
      bkash: 'bKash',
      stripe: 'Stripe',
    };
    return value ? (labels[value] || value.replace(/_/g, ' ')) : 'N/A';
  }
}
