import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomerLayoutComponent } from './layout/customer-layout.component';
import { CustomerHomeComponent } from './home/customer-home.component';
import { CustomerCartComponent } from './cart/customer-cart.component';
import { CustomerOrdersComponent } from './orders/customer-orders.component';
import { CustomerProfileComponent } from './profile/customer-profile.component';
import { CustomerLoyaltyComponent } from './loyalty/customer-loyalty.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: CustomerHomeComponent },
      { path: 'cart', component: CustomerCartComponent },
      { path: 'orders', component: CustomerOrdersComponent },
      { path: 'profile', component: CustomerProfileComponent },
      { path: 'loyalty', component: CustomerLoyaltyComponent },
    ],
  },
];

@NgModule({
  declarations: [
    CustomerLayoutComponent, CustomerHomeComponent, CustomerCartComponent,
    CustomerOrdersComponent, CustomerProfileComponent, CustomerLoyaltyComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class CustomerModule {}
