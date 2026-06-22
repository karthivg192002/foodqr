import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CustomerLayoutComponent } from './layout/customer-layout.component';
import { CustomerHomeComponent } from './home/customer-home.component';
import { CustomerCartComponent } from './cart/customer-cart.component';
import { CustomerOrdersComponent } from './orders/customer-orders.component';
import { CustomerProfileComponent } from './profile/customer-profile.component';
import { CustomerLoyaltyComponent } from './loyalty/customer-loyalty.component';
import { CustomerDashboardComponent } from './dashboard/customer-dashboard.component';
import { CustomerTrackComponent } from './track/customer-track.component';
import { CustomerChatComponent } from './chat/customer-chat.component';
import { CustomerScanComponent } from './scan/customer-scan.component';
import { CustomerMenuComponent } from './menu/customer-menu.component';
import { ItemDetailsComponent } from './item-details/item-details.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'home', component: CustomerHomeComponent },
      { path: 'menu', component: CustomerMenuComponent },
      { path: 'item/:id', component: ItemDetailsComponent },
      { path: 'cart', component: CustomerCartComponent },
      { path: 'orders', component: CustomerOrdersComponent },
      { path: 'track/:token', component: CustomerTrackComponent },
      { path: 'profile', component: CustomerProfileComponent },
      { path: 'loyalty', component: CustomerLoyaltyComponent },
      { path: 'chat', component: CustomerChatComponent },
      { path: 'scan', component: CustomerScanComponent },
    ],
  },
];

@NgModule({
  declarations: [
    CustomerLayoutComponent, CustomerHomeComponent, CustomerCartComponent,
    CustomerOrdersComponent, CustomerProfileComponent, CustomerLoyaltyComponent,
    CustomerDashboardComponent, CustomerTrackComponent, CustomerChatComponent,
    CustomerScanComponent, CustomerMenuComponent, ItemDetailsComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes), SharedModule],
})
export class CustomerModule {}
