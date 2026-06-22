import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';

interface CustomerNavItem {
  label: string;
  icon: string;
  route: string;
}

const DEFAULT_NAV_ITEMS: CustomerNavItem[] = [
  { label: 'Home', icon: 'home', route: '/customer/home' },
  { label: 'Menu', icon: 'menu', route: '/customer/menu' },
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
  branding$ = this.themeService.branding$;
  /** Cart/checkout has its own full-screen footer (Place Order bar) — hide the nav chrome that would otherwise stack on top of it. */
  hideNavChrome = false;

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private api: ApiService,
    private themeService: ThemeService,
    private router: Router,
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

    this.hideNavChrome = this.router.url.startsWith('/customer/cart') || this.router.url.startsWith('/customer/item');
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.hideNavChrome = e.urlAfterRedirects.startsWith('/customer/cart') || e.urlAfterRedirects.startsWith('/customer/item');
    });
  }

  get sideNavItems(): CustomerNavItem[] {
    return this.navItems.filter((i) => i.route !== '/customer/scan');
  }

  get scanItem(): CustomerNavItem | undefined {
    return this.navItems.find((i) => i.route === '/customer/scan');
  }

  /** Maps this layout's legacy icon keys (also used by the backend-driven nav-menus API) to Material Symbols names. */
  matIcon(key: string): string {
    const map: Record<string, string> = {
      home: 'home',
      menu: 'restaurant_menu',
      qr: 'qr_code_scanner',
      orders: 'receipt_long',
      star: 'redeem',
      user: 'person',
    };
    return map[key] || 'circle';
  }
}
