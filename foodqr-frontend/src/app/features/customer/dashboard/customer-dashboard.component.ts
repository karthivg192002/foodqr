import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
})
export class CustomerDashboardComponent implements OnInit {
  profile: any = null;
  loyalty: any = null;
  recentOrders: Order[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    forkJoin({
      profile: this.api.get<any>('auth/customer/dashboard'),
      loyalty: this.api.get<any>('loyalty/dashboard'),
      orders: this.api.get<any>('orders/my-orders', { page: 1, limit: 5 }),
    }).subscribe({
      next: ({ profile, loyalty, orders }) => {
        this.profile = profile;
        this.loyalty = loyalty;
        this.recentOrders = orders.data || [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get loyaltyPercent(): number {
    if (!this.loyalty?.requiredStamps) return 0;
    return Math.min(100, (this.loyalty.totalStamps / this.loyalty.requiredStamps) * 100);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-blue-100 text-blue-800',
      prepared: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  trackOrder(order: Order): void {
    this.router.navigate(['/customer/track', order.token]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
