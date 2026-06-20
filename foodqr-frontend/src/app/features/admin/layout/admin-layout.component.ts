import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserRole } from '../../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  external?: boolean;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  mobileSidebarOpen = false;
  userMenuOpen = false;
  breadcrumbs: { label: string; url?: string }[] = [];

  private readonly DEFAULT_NAV_GROUPS: NavGroup[] = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/admin/dashboard', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'My Dashboard', icon: 'home', route: '/admin/staff-dashboard', roles: [UserRole.WAITER, UserRole.CHEF, UserRole.STAFF] },
      ],
    },
    {
      heading: 'Operations',
      items: [
        { label: 'Live Orders', icon: 'orders', route: '/admin/orders' },
        { label: 'Kitchen Display', icon: 'kitchen', route: '/kds', external: true, roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.CHEF, UserRole.STAFF] },
        { label: 'Order Status', icon: 'tv', route: '/oss', external: true, roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Point of Sale', icon: 'pos', route: '/pos', external: true, roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR] },
      ],
    },
    {
      heading: 'Menu Management',
      items: [
        { label: 'Categories', icon: 'tag', route: '/admin/menu/categories', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Menu Items', icon: 'menu', route: '/admin/menu/items', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Item Extras', icon: 'plus-circle', route: '/admin/menu/extras', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Item Attributes', icon: 'tag', route: '/admin/menu/attributes', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
      ],
    },
    {
      heading: 'Customer & Staff',
      items: [
        { label: 'Customers', icon: 'users', route: '/admin/customers', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Staff & Employees', icon: 'user-check', route: '/admin/staff', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Admin Management', icon: 'key', route: '/admin/administrators', roles: [UserRole.ADMIN] },
        { label: 'Messaging', icon: 'chat', route: '/admin/messaging', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
      ],
    },
    {
      heading: 'Restaurant',
      items: [
        { label: 'Dining Tables', icon: 'table', route: '/admin/dining-tables', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER] },
        { label: 'Branches', icon: 'building', route: '/admin/branches', roles: [UserRole.ADMIN] },
        { label: 'Time Slots', icon: 'clock', route: '/admin/time-slots', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
      ],
    },
    {
      heading: 'Marketing',
      items: [
        { label: 'Loyalty Program', icon: 'star', route: '/admin/loyalty', roles: [UserRole.ADMIN] },
        { label: 'Offers & Banners', icon: 'gift', route: '/admin/offers', roles: [UserRole.ADMIN] },
      ],
    },
    {
      heading: 'Finance & Reports',
      items: [
        { label: 'Reports', icon: 'chart', route: '/admin/reports', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Transactions', icon: 'credit-card', route: '/admin/transactions', roles: [UserRole.ADMIN] },
        { label: 'Currency & Tax', icon: 'currency', route: '/admin/currency-tax', roles: [UserRole.ADMIN] },
      ],
    },
    {
      heading: 'Configuration',
      items: [
        { label: 'Settings', icon: 'settings', route: '/admin/settings', roles: [UserRole.ADMIN] },
        { label: 'Payment Gateways', icon: 'card', route: '/admin/payment-gateways', roles: [UserRole.ADMIN] },
      ],
    },
  ];

  navGroups: NavGroup[] = this.DEFAULT_NAV_GROUPS;
  branding$ = this.themeService.branding$;

  constructor(
    public authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.loadNav();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
        this.mobileSidebarOpen = false;
        this.userMenuOpen = false;
      });

    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  private loadNav(): void {
    this.api.get<any[]>('admin/nav-menus/my-nav').subscribe({
      next: (items) => {
        if (!items?.length) return;
        this.navGroups = this.buildGroupsFromApi(items);
      },
      error: () => { /* fall back to DEFAULT_NAV_GROUPS already set */ },
    });
  }

  private buildGroupsFromApi(items: any[]): NavGroup[] {
    const groupMap = new Map<string, NavGroup>();
    for (const item of items) {
      if (!groupMap.has(item.group)) {
        groupMap.set(item.group, { heading: item.group, items: [] });
      }
      groupMap.get(item.group)!.items.push({
        label: item.name,
        icon: item.iconKey,
        route: item.route,
        external: item.external,
        roles: item.roles?.length ? (item.roles as UserRole[]) : undefined,
      });
    }
    return Array.from(groupMap.values());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth >= 1024) {
      this.mobileSidebarOpen = false;
    }
  }

  buildBreadcrumbs(): void {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(Boolean);
    this.breadcrumbs = [];
    let cumulative = '';
    for (const seg of segments) {
      cumulative += '/' + seg;
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      this.breadcrumbs.push({ label, url: cumulative });
    }
  }

  isNavVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    return item.roles.includes(this.authService.currentUser?.role as UserRole);
  }

  isGroupVisible(group: NavGroup): boolean {
    return group.items.some((item) => this.isNavVisible(item));
  }

  navigateTo(item: NavItem): void {
    this.router.navigate([item.route]);
  }

  get userInitials(): string {
    const name = this.authService.currentUser?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  }

  logout(): void {
    this.authService.logout();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }
}
