import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-superadmin-layout',
  templateUrl: './superadmin-layout.component.html',
})
export class SuperadminLayoutComponent {
  mobileSidebarOpen = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/superadmin/dashboard' },
    { label: 'Tenants', icon: 'building', route: '/superadmin/tenants' },
    { label: 'Plans', icon: 'tag', route: '/superadmin/plans' },
    { label: 'Billing', icon: 'card', route: '/superadmin/billing' },
  ];

  constructor(public authService: AuthService) {}

  get userInitials(): string {
    const name = this.authService.currentUser?.name ?? '';
    return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('');
  }

  logout(): void {
    this.authService.logout();
  }
}
