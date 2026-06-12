import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderType, PaymentMethod, CartItem } from '../../../core/models';

@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html',
})
export class CustomerCartComponent {
  orderType = OrderType.DELIVERY;
  paymentMethod = PaymentMethod.CASH_ON_DELIVERY;
  orderNote = '';
  placing = false;
  OrderType = OrderType;
  PaymentMethod = PaymentMethod;

  constructor(
    public cartService: CartService,
    private api: ApiService,
    private router: Router,
    private toastr: ToastrService,
    public authService: AuthService,
  ) {}

  getItemPrice(cartItem: CartItem): number { return this.cartService.getItemPrice(cartItem); }

  placeOrder(): void {
    if (this.cartService.isEmpty) return;
    if (!this.authService.isAuthenticated) { this.router.navigate(['/auth/login']); return; }

    this.placing = true;
    const order = {
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      items: this.cartService.toOrderItems(),
      orderNote: this.orderNote,
    };

    this.api.post<any>('orders', order).subscribe({
      next: (created) => {
        this.cartService.clear();
        this.toastr.success('Order placed successfully!');
        this.router.navigate(['/customer/orders']);
        this.placing = false;
      },
      error: () => { this.placing = false; },
    });
  }
}
