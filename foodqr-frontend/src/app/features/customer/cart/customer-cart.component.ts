import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderType, CartItem } from '../../../core/models';

@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html',
})
export class CustomerCartComponent implements OnInit {
  orderType = OrderType.DELIVERY;
  paymentMethod = 'cash_on_delivery';
  orderNote = '';
  placing = false;
  couponCode = '';
  OrderType = OrderType;

  enabledGateways: any[] = [];
  savedAddresses: any[] = [];
  selectedAddressId = '';

  constructor(
    public cartService: CartService,
    private api: ApiService,
    private router: Router,
    private toastr: ToastrService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadGateways();
    this.loadAddresses();
  }

  loadGateways(): void {
    this.api.get<any[]>('payment-gateways/active').subscribe({
      next: (gateways) => {
        this.enabledGateways = [
          { slug: 'cash_on_delivery', name: 'Cash on Delivery' },
          { slug: 'e_wallet', name: 'Wallet Balance' },
          ...(gateways || []).filter((g) => g.slug !== 'credit'),
        ];
        if (this.enabledGateways.length) this.paymentMethod = this.enabledGateways[0].slug;
      },
      error: () => {
        this.enabledGateways = [
          { slug: 'cash_on_delivery', name: 'Cash on Delivery' },
          { slug: 'e_wallet', name: 'Wallet Balance' },
        ];
      },
    });
  }

  loadAddresses(): void {
    if (!this.authService.isAuthenticated) return;
    this.api.get<any[]>('addresses').subscribe({
      next: (addrs) => {
        this.savedAddresses = addrs || [];
        const def = this.savedAddresses.find((a) => a.isDefault);
        if (def) this.selectedAddressId = def.id;
      },
    });
  }

  getItemPrice(cartItem: CartItem): number { return this.cartService.getItemPrice(cartItem); }

  placeOrder(): void {
    if (this.cartService.isEmpty) return;
    if (!this.authService.isAuthenticated) { this.router.navigate(['/auth/login']); return; }

    if (this.orderType === OrderType.DELIVERY && !this.selectedAddressId && this.savedAddresses.length) {
      this.toastr.warning('Please select a delivery address');
      return;
    }

    this.placing = true;
    const selectedAddr = this.savedAddresses.find((a) => a.id === this.selectedAddressId);
    const order: any = {
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      items: this.cartService.toOrderItems(),
      orderNote: this.orderNote,
    };
    if (this.couponCode) order.couponCode = this.couponCode;
    if (selectedAddr) {
      order.deliveryAddressSnapshot = {
        label: selectedAddr.label,
        address: selectedAddr.address,
        city: selectedAddr.city,
        phone: selectedAddr.phone,
      };
    }

    this.api.post<any>('orders', order).subscribe({
      next: () => {
        this.cartService.clear();
        this.toastr.success('Order placed successfully!');
        this.router.navigate(['/customer/orders']);
        this.placing = false;
      },
      error: () => { this.placing = false; },
    });
  }
}
