import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { SuperadminLayoutComponent } from './layout/superadmin-layout.component';
import { SuperadminDashboardComponent } from './dashboard/superadmin-dashboard.component';
import { SuperadminTenantsComponent } from './tenants/superadmin-tenants.component';
import { SuperadminPlansComponent } from './plans/superadmin-plans.component';
import { SuperadminBillingComponent } from './billing/superadmin-billing.component';

const routes: Routes = [
  {
    path: '',
    component: SuperadminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SuperadminDashboardComponent },
      { path: 'tenants', component: SuperadminTenantsComponent },
      { path: 'plans', component: SuperadminPlansComponent },
      { path: 'billing', component: SuperadminBillingComponent },
    ],
  },
];

@NgModule({
  declarations: [
    SuperadminLayoutComponent,
    SuperadminDashboardComponent,
    SuperadminTenantsComponent,
    SuperadminPlansComponent,
    SuperadminBillingComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class SuperadminModule {}
