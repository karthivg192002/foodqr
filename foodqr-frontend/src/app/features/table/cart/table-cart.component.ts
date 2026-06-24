import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { CartItem, PaymentMethod, OrderType } from '../../../core/models';

@Component({
  selector: 'app-table-cart',
  templateUrl: './table-cart.component.html',
})
export class TableCartComponent {
  slug = '';
  orderNote = '';
  placing = false;
  PaymentMethod = PaymentMethod;
  paymentMethod: string = PaymentMethod.CASH_ON_DELIVERY;
  paymentGateway = '';
  enabledGateways: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public cartService: CartService,
    private toastr: ToastrService,
  ) {
    this.slug = this.route.snapshot.paramMap.get('slug')!;
    this.loadGateways();
  }

  loadGateways(): void {
    this.api.get<any[]>('payment-gateways/active').subscribe({
      next: (gateways) => {
        const onlineGateways = (gateways || []).filter((g) => !['credit', 'cash_on_delivery', 'e_wallet'].includes(g.slug));
        this.enabledGateways = [
          { slug: 'cash_on_delivery', name: 'Cash on Delivery' },
          { slug: 'e_wallet', name: 'Wallet' },
          ...onlineGateways,
        ];
      },
      error: () => {
        this.enabledGateways = [
          { slug: 'cash_on_delivery', name: 'Cash on Delivery' },
          { slug: 'e_wallet', name: 'Wallet' },
        ];
      },
    });
  }

  getItemPrice(cartItem: CartItem): number { return this.cartService.getItemPrice(cartItem); }

  placeOrder(): void {
    if (this.cartService.isEmpty) return;
    this.placing = true;
    this.api.get<any>(`frontend/dining-tables/slug/${this.slug}`).subscribe({
      next: (table) => {
        const order = {
          orderType: OrderType.DINING_TABLE,
          paymentMethod: this.paymentMethod,
          paymentGateway: this.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY && this.paymentMethod !== PaymentMethod.E_WALLET
            ? this.paymentMethod
            : null,
          diningTableId: table.id,
          branchId: table.branchId,
          items: this.cartService.toOrderItems(),
          orderNote: this.orderNote,
        };
        this.api.post<any>('table/orders', order).subscribe({
          next: (created) => {
            this.cartService.clear();
            this.toastr.success('Order placed!');
            this.router.navigate(['/table', this.slug, 'track', created.token]);
            this.placing = false;
          },
          error: () => { this.placing = false; },
        });
      },
      error: () => { this.placing = false; },
    });
  }
}
