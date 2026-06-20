import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ApiService } from '../../../core/services/api.service';

interface CustomerNavItem {
  label: string;
  icon: string;
  route: string;
}

const DEFAULT_NAV_ITEMS: CustomerNavItem[] = [
  { label: 'Home', icon: 'home', route: '/customer/home' },
  { label: 'Scan', icon: 'qr', route: '/customer/scan' },
  { label: 'Orders', icon: 'orders', route: '/customer/orders' },
  { label: 'Rewards', icon: 'star', route: '/customer/loyalty' },
  { label: 'Profile', icon: 'user', route: '/customer/dashboard' },
];

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
})
export class CustomerLayoutComponent implements OnInit {
  navItems: CustomerNavItem[] = DEFAULT_NAV_ITEMS;

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.get<any[]>('admin/nav-menus/my-nav').subscribe({
      next: (items) => {
        if (!items?.length) return;
        this.navItems = items
          .filter((i) => !i.external)
          .map((i) => ({ label: i.name, icon: i.iconKey, route: i.route }));
      },
      error: () => { /* fall back to DEFAULT_NAV_ITEMS already set */ },
    });
  }

  get sideNavItems(): CustomerNavItem[] {
    return this.navItems.filter((i) => i.route !== '/customer/scan');
  }

  get scanItem(): CustomerNavItem | undefined {
    return this.navItems.find((i) => i.route === '/customer/scan');
  }
}
