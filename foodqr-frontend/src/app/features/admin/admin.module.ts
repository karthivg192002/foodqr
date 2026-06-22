import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthGuard } from '../../core/guards/auth.guard';
import { UserRole } from '../../core/models';
import { SharedModule } from '../../shared/shared.module';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuCategoriesComponent } from './menu/categories/menu-categories.component';
import { MenuItemsComponent } from './menu/items/menu-items.component';
import { MenuExtrasComponent } from './menu/extras/menu-extras.component';
import { ItemAttributesComponent } from './menu/attributes/item-attributes.component';
import { CustomersComponent } from './customers/customers.component';
import { StaffComponent } from './staff/staff.component';
import { DiningTablesComponent } from './dining-tables/dining-tables.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';
import { OffersComponent } from './offers/offers.component';
import { BranchesComponent } from './branches/branches.component';
import { CurrencyTaxComponent } from './currency-tax/currency-tax.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TimeSlotsComponent } from './time-slots/time-slots.component';
import { PaymentGatewaysComponent } from './payment-gateways/payment-gateways.component';
import { MessagingComponent } from './messaging/messaging.component';
import { PromotionBannersComponent } from './promotion-banners/promotion-banners.component';
import { MenuManagementComponent } from './menu-management/menu-management.component';
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component';
import { AnalyticsSectionsComponent } from './analytics-sections/analytics-sections.component';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { RoleManagerComponent } from './role-manager/role-manager.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import { TableOrdersComponent } from './table-orders/table-orders.component';
import { SubscriptionComponent } from './subscription/subscription.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',            component: DashboardComponent, canActivate: [AuthGuard], data: { roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] } },
      { path: 'orders',               component: OrdersComponent },
      { path: 'table-orders',         component: TableOrdersComponent },
      { path: 'menu/categories',      component: MenuCategoriesComponent },
      { path: 'menu/items',           component: MenuItemsComponent },
      { path: 'menu/extras',          component: MenuExtrasComponent },
      { path: 'menu/attributes',      component: ItemAttributesComponent },
      { path: 'customers',            component: CustomersComponent },
      { path: 'staff',                component: StaffComponent },
      { path: 'dining-tables',        component: DiningTablesComponent },
      { path: 'loyalty',              component: LoyaltyComponent },
      { path: 'reports',              component: ReportsComponent },
      { path: 'settings',             component: SettingsComponent },
      { path: 'offers',               component: OffersComponent },
      { path: 'branches',             component: BranchesComponent },
      { path: 'currency-tax',         component: CurrencyTaxComponent },
      { path: 'transactions',         component: TransactionsComponent },
      { path: 'time-slots',           component: TimeSlotsComponent },
      { path: 'payment-gateways',     component: PaymentGatewaysComponent },
      { path: 'messaging',            component: MessagingComponent },
      { path: 'promotion-banners',    component: PromotionBannersComponent },
      { path: 'menu-management',      component: MenuManagementComponent },
      { path: 'roles-permissions',    component: RolesPermissionsComponent },
      { path: 'analytics-sections',   component: AnalyticsSectionsComponent },
      { path: 'staff-dashboard',       component: StaffDashboardComponent },
      { path: 'role-manager',          component: RoleManagerComponent },
      { path: 'administrators',       component: AdminManagementComponent, canActivate: [AuthGuard], data: { roles: [UserRole.ADMIN] } },
      { path: 'subscription',         component: SubscriptionComponent, canActivate: [AuthGuard], data: { roles: [UserRole.ADMIN] } },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    OrdersComponent,
    MenuCategoriesComponent,
    MenuItemsComponent,
    MenuExtrasComponent,
    ItemAttributesComponent,
    CustomersComponent,
    StaffComponent,
    DiningTablesComponent,
    LoyaltyComponent,
    ReportsComponent,
    SettingsComponent,
    OffersComponent,
    BranchesComponent,
    CurrencyTaxComponent,
    TransactionsComponent,
    TimeSlotsComponent,
    PaymentGatewaysComponent,
    MessagingComponent,
    PromotionBannersComponent,
    MenuManagementComponent,
    RolesPermissionsComponent,
    AnalyticsSectionsComponent,
    StaffDashboardComponent,
    RoleManagerComponent,
    AdminManagementComponent,
    TableOrdersComponent,
    SubscriptionComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class AdminModule {}
