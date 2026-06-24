import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderType, CartItem, Tax, ServiceCharge } from '../../../core/models';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html',
})
export class CustomerCartComponent implements OnInit {
  orderType = OrderType.DELIVERY;
  paymentMethod = 'cash_on_delivery';
  paymentGateway = '';
  orderNote = '';
  placing = false;
  couponCode = '';
  OrderType = OrderType;

  enabledGateways: any[] = [];
  savedAddresses: any[] = [];
  selectedAddressId = '';
  defaultTax: Tax | null = null;
  defaultServiceCharge: ServiceCharge | null = null;

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
    this.loadTax();
    this.loadServiceCharge();
  }

  loadTax(): void {
    this.api.get<Tax[]>('frontend/taxes').subscribe({
      next: (taxes) => { this.defaultTax = (taxes || []).find((t) => t.isDefault) || taxes?.[0] || null; },
      error: () => {},
    });
  }

  loadServiceCharge(): void {
    this.api.get<ServiceCharge[]>('frontend/service-charges').subscribe({
      next: (charges) => { this.defaultServiceCharge = (charges || []).find((c) => c.isDefault) || charges?.[0] || null; },
      error: () => {},
    });
  }

  get taxAmount(): number {
    if (!this.defaultTax || this.defaultTax.isIncluded) return 0;
    return this.cartService.total * (Number(this.defaultTax.rate) / 100);
  }

  get serviceChargeAmount(): number {
    if (!this.defaultServiceCharge || this.defaultServiceCharge.isIncluded) return 0;
    return this.cartService.total * (Number(this.defaultServiceCharge.rate) / 100);
  }

  get grandTotal(): number {
    return this.cartService.total + this.taxAmount + this.serviceChargeAmount;
  }

  loadGateways(): void {
    this.api.get<any[]>('payment-gateways/active').subscribe({
      next: (gateways) => {
        const onlineGateways = (gateways || []).filter((g) => !['credit', 'cash_on_delivery', 'e_wallet'].includes(g.slug));
        this.enabledGateways = [
          { slug: 'cash_on_delivery', name: 'Cash on Delivery' },
          { slug: 'e_wallet', name: 'Wallet Balance' },
          ...onlineGateways,
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

  paymentLabel(slug?: string | null): string {
    if (!slug) return 'N/A';
    return this.enabledGateways.find((gw) => gw.slug === slug)?.name || slug.replace(/_/g, ' ');
  }

  guestCheckout(): void {
    if (this.cartService.isEmpty) return;
    const name = prompt('Enter your name to continue as guest:');
    if (!name?.trim()) return;
    this.placing = true;
    this.api.post<any>('auth/guest', { name: name.trim() }).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.toastr.success('Continuing as guest');
        this.placing = false;
        this.placeOrder();
      },
      error: () => { this.placing = false; },
    });
  }

  placeOrder(): void {
    if (this.cartService.isEmpty) return;
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/customer/cart' } });
      return;
    }

    if (this.orderType === OrderType.DELIVERY && !this.selectedAddressId && this.savedAddresses.length) {
      this.toastr.warning('Please select a delivery address');
      return;
    }

    this.placing = true;
    const selectedAddr = this.savedAddresses.find((a) => a.id === this.selectedAddressId);
    const selectedPaymentGateway = this.paymentMethod !== 'cash_on_delivery' && this.paymentMethod !== 'e_wallet'
      ? this.paymentMethod
      : null;
    const order: any = {
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      paymentGateway: selectedPaymentGateway,
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
      next: (created) => {
        if (this.paymentMethod === 'razorpay') {
          this.openRazorpayCheckout(created);
          return;
        }

        this.finishOrder('Order placed successfully!');
      },
      error: () => { this.placing = false; },
    });
  }

  private openRazorpayCheckout(order: any): void {
    if (!window.Razorpay) {
      this.placing = false;
      this.toastr.error('Razorpay checkout failed to load. Check your internet connection or script blockers.');
      return;
    }

    this.api.post<any>('payments/razorpay/create-order', { orderId: order.id }).subscribe({
      next: (rz) => {
        const checkout = new window.Razorpay({
          key: rz.keyId,
          amount: rz.amount,
          currency: rz.currency || 'INR',
          name: 'FoodQR',
          description: `Order #${order.orderSerialNo}`,
          order_id: rz.razorpayOrderId,
          handler: (response: any) => this.verifyRazorpayPayment(order, response),
          modal: {
            ondismiss: () => {
              this.placing = false;
              this.toastr.warning('Payment was cancelled. Your order is still unpaid.');
              this.router.navigate(['/customer/orders']);
            },
          },
          theme: { color: '#f97316' },
        });
        checkout.open();
      },
      error: () => {
        this.placing = false;
      },
    });
  }

  private verifyRazorpayPayment(order: any, response: any): void {
    this.api.post<any>('payments/razorpay/verify', {
      orderId: order.id,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    }).subscribe({
      next: () => this.finishOrder('Payment successful!'),
      error: () => {
        this.placing = false;
        this.toastr.error('Payment verification failed. Please contact support with your order number.');
        this.router.navigate(['/customer/orders']);
      },
    });
  }

  private finishOrder(message: string): void {
    this.cartService.clear();
    this.toastr.success(message);
    this.router.navigate(['/customer/orders']);
    this.placing = false;
  }
}
