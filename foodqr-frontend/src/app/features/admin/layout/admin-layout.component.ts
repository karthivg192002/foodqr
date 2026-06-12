import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
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

  navGroups: NavGroup[] = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
      ],
    },
    {
      heading: 'Operations',
      items: [
        { label: 'Live Orders', icon: 'orders', route: '/admin/orders' },
        {
          label: 'Kitchen Display', icon: 'kitchen', route: '/kds',
          external: true,
          roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.CHEF, UserRole.STAFF],
        },
        {
          label: 'Order Status', icon: 'tv', route: '/oss',
          external: true,
          roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
        },
        {
          label: 'Point of Sale', icon: 'pos', route: '/pos',
          external: true,
          roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR],
        },
      ],
    },
    {
      heading: 'Menu Management',
      items: [
        { label: 'Categories', icon: 'tag', route: '/admin/menu/categories', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Menu Items', icon: 'menu', route: '/admin/menu/items', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Item Extras', icon: 'plus-circle', route: '/admin/menu/extras', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
      ],
    },
    {
      heading: 'Customer & Staff',
      items: [
        { label: 'Customers', icon: 'users', route: '/admin/customers', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
        { label: 'Staff & Employees', icon: 'user-check', route: '/admin/staff', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
      ],
    },
    {
      heading: 'Restaurant',
      items: [
        { label: 'Dining Tables', icon: 'table', route: '/admin/dining-tables', roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER] },
        { label: 'Branches', icon: 'building', route: '/admin/branches', roles: [UserRole.ADMIN] },
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
      ],
    },
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
        this.mobileSidebarOpen = false;
        this.userMenuOpen = false;
      });

    // Collapse sidebar on small screens by default
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
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
