import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Branch } from '../../../core/models';

interface CustomerNavItem {
  label: string;
  icon: string;
  route: string;
}

/** Desktop sidebar — operational navigation */
const DESKTOP_NAV_ITEMS: CustomerNavItem[] = [
  { label: 'Home',    icon: 'home',   route: '/customer/home' },
  { label: 'Menu',    icon: 'menu',   route: '/customer/menu' },
  { label: 'Orders',  icon: 'orders', route: '/customer/orders' },
  { label: 'Scan',    icon: 'qr',     route: '/customer/scan' },
  { label: 'Rewards', icon: 'star',   route: '/customer/loyalty' },
  { label: 'Account', icon: 'user',   route: '/customer/dashboard' },
];

/** Mobile bottom nav — discovery + quick-action focused.
 *  Cart is the elevated centre action; the other 4 are rendered as regular tabs. */
const MOBILE_NAV_ITEMS: CustomerNavItem[] = [
  { label: 'Home',       icon: 'home',   route: '/customer/home' },
  { label: 'Search',     icon: 'search', route: '/customer/menu' },
  { label: 'Cart',       icon: 'cart',   route: '/customer/cart' },
  { label: 'Assistance', icon: 'chat',   route: '/customer/chat' },
  { label: 'Profile',    icon: 'user',   route: '/customer/dashboard' },
];

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
})
export class CustomerLayoutComponent implements OnInit {
  navItems: CustomerNavItem[] = DESKTOP_NAV_ITEMS;
  mobileNavItems: CustomerNavItem[] = MOBILE_NAV_ITEMS;
  branding$ = this.themeService.branding$;
  hideNavChrome = false;

  branches: Branch[] = [];
  showBranchPicker = false;
  selectedBranch$ = this.cartService.selectedBranch$;

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
      error: () => {},
    });

    this.hideNavChrome = this.isHiddenRoute(this.router.url);
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.hideNavChrome = this.isHiddenRoute(e.urlAfterRedirects);
      });

    this.api.get<Branch[]>('frontend/branches').subscribe({
      next: (branches) => {
        this.branches = branches || [];
        if (!this.cartService.branchId) {
          const defaultBranch = this.branches.find((b) => b.isDefault) || this.branches[0];
          if (defaultBranch) this.cartService.selectBranch(defaultBranch.id, defaultBranch.name);
        }
      },
      error: () => {},
    });
  }

  toggleBranchPicker(): void {
    this.showBranchPicker = !this.showBranchPicker;
  }

  pickBranch(branch: Branch): void {
    this.cartService.selectBranch(branch.id, branch.name);
    this.showBranchPicker = false;
  }

  private isHiddenRoute(url: string): boolean {
    return url.startsWith('/customer/cart') || url.startsWith('/customer/item');
  }

  /** Left two tabs on the mobile bottom bar (Home, Search). */
  get mobileLeftItems(): CustomerNavItem[] {
    return this.mobileNavItems.filter((i) => i.icon !== 'cart').slice(0, 2);
  }

  /** Right two tabs on the mobile bottom bar (Assistance, Profile). */
  get mobileRightItems(): CustomerNavItem[] {
    return this.mobileNavItems.filter((i) => i.icon !== 'cart').slice(2);
  }

  /** Elevated centre action on the mobile bottom bar (Cart). */
  get mobileCenterItem(): CustomerNavItem | undefined {
    return this.mobileNavItems.find((i) => i.icon === 'cart');
  }

  matIcon(key: string): string {
    const map: Record<string, string> = {
      home:   'home',
      menu:   'restaurant_menu',
      qr:     'qr_code_scanner',
      orders: 'receipt_long',
      star:   'redeem',
      user:   'person',
      search: 'search',
      cart:   'shopping_bag',
      chat:   'support_agent',
    };
    return map[key] || 'circle';
  }
}
