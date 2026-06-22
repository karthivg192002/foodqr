import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, PublicGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models';

const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [PublicGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER, UserRole.POS_OPERATOR] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: 'superadmin',
    canActivate: [AuthGuard],
    data: { roles: [UserRole.SUPER_ADMIN] },
    loadChildren: () => import('./features/superadmin/superadmin.module').then(m => m.SuperadminModule),
  },
  {
    path: 'customer',
    canActivate: [AuthGuard],
    data: { roles: [UserRole.CUSTOMER] },
    loadChildren: () => import('./features/customer/customer.module').then(m => m.CustomerModule),
  },
  {
    path: 'table',
    loadChildren: () => import('./features/table/table.module').then(m => m.TableModule),
  },
  {
    path: 'kds',
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.CHEF, UserRole.STAFF] },
    loadChildren: () => import('./features/kds/kds.module').then(m => m.KdsModule),
  },
  {
    path: 'oss',
    loadChildren: () => import('./features/oss/oss.module').then(m => m.OssModule),
  },
  {
    path: 'pos',
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR] },
    loadChildren: () => import('./features/pos/pos.module').then(m => m.PosModule),
  },
  { path: '**', redirectTo: '/auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
