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
  paymentMethod = PaymentMethod.CASH_ON_DELIVERY;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public cartService: CartService,
    private toastr: ToastrService,
  ) {
    this.slug = this.route.snapshot.paramMap.get('slug')!;
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
          diningTableId: table.id,
          items: this.cartService.toOrderItems(),
          orderNote: this.orderNote,
        };
        this.api.post<any>('orders', order).subscribe({
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
