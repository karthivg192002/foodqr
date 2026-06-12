import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuCategoriesComponent } from './menu/categories/menu-categories.component';
import { MenuItemsComponent } from './menu/items/menu-items.component';
import { MenuExtrasComponent } from './menu/extras/menu-extras.component';
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

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',       component: DashboardComponent },
      { path: 'orders',          component: OrdersComponent },
      { path: 'menu/categories', component: MenuCategoriesComponent },
      { path: 'menu/items',      component: MenuItemsComponent },
      { path: 'menu/extras',     component: MenuExtrasComponent },
      { path: 'customers',       component: CustomersComponent },
      { path: 'staff',           component: StaffComponent },
      { path: 'dining-tables',   component: DiningTablesComponent },
      { path: 'loyalty',         component: LoyaltyComponent },
      { path: 'reports',         component: ReportsComponent },
      { path: 'settings',        component: SettingsComponent },
      { path: 'offers',          component: OffersComponent },
      { path: 'branches',        component: BranchesComponent },
      { path: 'currency-tax',    component: CurrencyTaxComponent },
      { path: 'transactions',    component: TransactionsComponent },
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
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule {}
