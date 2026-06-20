import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NavMenu } from './entities/nav-menu.entity';

const SEED_ITEMS: Partial<NavMenu>[] = [
  // Overview
  { group: 'Overview', groupOrder: 1, name: 'Dashboard',     iconKey: 'home',        route: '/admin/dashboard',      external: false, roles: ['admin','branch_manager'],                        sortOrder: 1 },
  { group: 'Overview', groupOrder: 1, name: 'My Dashboard',  iconKey: 'home',        route: '/admin/staff-dashboard', external: false, roles: ['waiter','chef','staff'],                        sortOrder: 2 },
  // Operations
  { group: 'Operations', groupOrder: 2, name: 'Live Orders',     iconKey: 'orders',  route: '/admin/orders',  external: false, roles: [],                                                       sortOrder: 1 },
  { group: 'Operations', groupOrder: 2, name: 'Table Orders',    iconKey: 'table',   route: '/admin/table-orders', external: false, roles: ['admin','branch_manager','waiter'],                 sortOrder: 1 },
  { group: 'Operations', groupOrder: 2, name: 'Kitchen Display',  iconKey: 'kitchen', route: '/kds',           external: true,  roles: ['admin','branch_manager','chef','staff'],                sortOrder: 2 },
  { group: 'Operations', groupOrder: 2, name: 'Order Status',     iconKey: 'tv',      route: '/oss',           external: true,  roles: ['admin','branch_manager'],                               sortOrder: 3 },
  { group: 'Operations', groupOrder: 2, name: 'Point of Sale',    iconKey: 'pos',     route: '/pos',           external: true,  roles: ['admin','branch_manager','pos_operator'],                sortOrder: 4 },
  // Menu Management
  { group: 'Menu Management', groupOrder: 3, name: 'Categories',      iconKey: 'tag',         route: '/admin/menu/categories',  external: false, roles: ['admin','branch_manager'], sortOrder: 1 },
  { group: 'Menu Management', groupOrder: 3, name: 'Menu Items',       iconKey: 'menu',        route: '/admin/menu/items',       external: false, roles: ['admin','branch_manager'], sortOrder: 2 },
  { group: 'Menu Management', groupOrder: 3, name: 'Item Extras',      iconKey: 'plus-circle', route: '/admin/menu/extras',      external: false, roles: ['admin','branch_manager'], sortOrder: 3 },
  { group: 'Menu Management', groupOrder: 3, name: 'Item Attributes',  iconKey: 'tag',         route: '/admin/menu/attributes',  external: false, roles: ['admin','branch_manager'], sortOrder: 4 },
  { group: 'Menu Management', groupOrder: 3, name: 'Menu Sections & Templates', iconKey: 'menu', route: '/admin/menu-management', external: false, roles: ['admin','branch_manager'], sortOrder: 5 },
  // Customer & Staff
  { group: 'Customer & Staff', groupOrder: 4, name: 'Customers',       iconKey: 'users',      route: '/admin/customers',  external: false, roles: ['admin','branch_manager'], sortOrder: 1 },
  { group: 'Customer & Staff', groupOrder: 4, name: 'Staff & Employees', iconKey: 'user-check', route: '/admin/staff',     external: false, roles: ['admin','branch_manager'], sortOrder: 2 },
  { group: 'Customer & Staff', groupOrder: 4, name: 'Messaging',       iconKey: 'chat',       route: '/admin/messaging',  external: false, roles: ['admin','branch_manager'], sortOrder: 3 },
  // Restaurant
  { group: 'Restaurant', groupOrder: 5, name: 'Dining Tables', iconKey: 'table',    route: '/admin/dining-tables', external: false, roles: ['admin','branch_manager','waiter'], sortOrder: 1 },
  { group: 'Restaurant', groupOrder: 5, name: 'Branches',      iconKey: 'building', route: '/admin/branches',      external: false, roles: ['admin'],                          sortOrder: 2 },
  { group: 'Restaurant', groupOrder: 5, name: 'Time Slots',    iconKey: 'clock',    route: '/admin/time-slots',    external: false, roles: ['admin','branch_manager'],          sortOrder: 3 },
  // Marketing
  { group: 'Marketing', groupOrder: 6, name: 'Loyalty Program', iconKey: 'star', route: '/admin/loyalty', external: false, roles: ['admin'], sortOrder: 1 },
  { group: 'Marketing', groupOrder: 6, name: 'Offers & Banners', iconKey: 'gift', route: '/admin/offers',  external: false, roles: ['admin'], sortOrder: 2 },
  // Finance & Reports
  { group: 'Finance & Reports', groupOrder: 7, name: 'Reports',       iconKey: 'chart',       route: '/admin/reports',       external: false, roles: ['admin','branch_manager'], sortOrder: 1 },
  { group: 'Finance & Reports', groupOrder: 7, name: 'Analytics',    iconKey: 'chart',       route: '/admin/analytics-sections', external: false, roles: ['admin','branch_manager'], sortOrder: 2 },
  { group: 'Finance & Reports', groupOrder: 7, name: 'Transactions',  iconKey: 'credit-card', route: '/admin/transactions',  external: false, roles: ['admin'],                  sortOrder: 3 },
  { group: 'Finance & Reports', groupOrder: 7, name: 'Currency & Tax', iconKey: 'currency',   route: '/admin/currency-tax',  external: false, roles: ['admin'],                  sortOrder: 4 },
  // Configuration
  { group: 'Configuration', groupOrder: 8, name: 'Settings',         iconKey: 'settings', route: '/admin/settings',         external: false, roles: ['admin'], sortOrder: 1 },
  { group: 'Configuration', groupOrder: 8, name: 'Roles & Permissions', iconKey: 'user-check', route: '/admin/roles-permissions', external: false, roles: ['admin'], sortOrder: 2 },
  { group: 'Configuration', groupOrder: 8, name: 'Role Manager',     iconKey: 'user-check', route: '/admin/role-manager',  external: false, roles: ['admin'], sortOrder: 3 },
  { group: 'Configuration', groupOrder: 8, name: 'Payment Gateways', iconKey: 'card',     route: '/admin/payment-gateways', external: false, roles: ['admin'], sortOrder: 4 },
  // Customer Nav (mobile/desktop nav for logged-in customers)
  { group: 'Customer Nav', groupOrder: 9, name: 'Home',        iconKey: 'home',  route: '/customer/home',    external: false, roles: ['customer'], sortOrder: 1 },
  { group: 'Customer Nav', groupOrder: 9, name: 'Scan & Order', iconKey: 'qr',   route: '/customer/scan',    external: false, roles: ['customer'], sortOrder: 2 },
  { group: 'Customer Nav', groupOrder: 9, name: 'Orders',      iconKey: 'orders', route: '/customer/orders', external: false, roles: ['customer'], sortOrder: 3 },
  { group: 'Customer Nav', groupOrder: 9, name: 'Rewards',     iconKey: 'star',  route: '/customer/loyalty', external: false, roles: ['customer'], sortOrder: 4 },
  { group: 'Customer Nav', groupOrder: 9, name: 'Profile',     iconKey: 'user',  route: '/customer/dashboard', external: false, roles: ['customer'], sortOrder: 5 },
];

@Injectable()
export class NavMenusService {
  constructor(@InjectRepository(NavMenu) private repo: Repository<NavMenu>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { groupOrder: 'ASC', sortOrder: 'ASC' } });
  }

  async findForRole(role: string) {
    const items = await this.findAll();
    return items.filter((item) => !item.roles?.length || item.roles.includes(role));
  }

  create(dto: Partial<NavMenu>) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<NavMenu>) {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async seed(force = false) {
    const count = await this.repo.count();
    if (count > 0 && !force) return { message: 'Already seeded', count };
    if (force) await this.repo.clear();
    const saved = await this.repo.save(SEED_ITEMS.map((s) => this.repo.create(s)));
    return { message: 'Seeded successfully', count: saved.length };
  }
}
