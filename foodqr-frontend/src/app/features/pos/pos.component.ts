import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Item, ItemCategory, OrderType, PaymentMethod, CartItem } from '../../core/models';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
})
export class PosComponent implements OnInit {
  categories: ItemCategory[] = [];
  items: Item[] = [];
  selectedCategory = '';
  search = '';
  loading = false;
  placing = false;
  paymentMethod = PaymentMethod.CASH_ON_DELIVERY;
  PaymentMethod = PaymentMethod;
  OrderType = OrderType;
  orderType = OrderType.POS;
  lastOrder: any = null;

  constructor(
    public cartService: CartService,
    private api: ApiService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
  }

  loadCategories(): void {
    this.api.get<ItemCategory[]>('frontend/categories').subscribe({ next: (d) => this.categories = d });
  }

  loadItems(): void {
    this.loading = true;
    const params: any = { limit: 100 };
    if (this.search) params.search = this.search;
    if (this.selectedCategory) params.categoryId = this.selectedCategory;
    this.api.get<any>('frontend/items', params).subscribe({
      next: (res) => { this.items = res.data || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  addToCart(item: Item): void { this.cartService.addItem(item); }

  getCartQty(itemId: string): number {
    return this.cartService.items.filter((i) => i.item.id === itemId).reduce((s, i) => s + i.quantity, 0);
  }

  getItemPrice(cartItem: CartItem): number { return this.cartService.getItemPrice(cartItem); }

  placeOrder(): void {
    if (this.cartService.isEmpty) return;
    this.placing = true;
    const order = {
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      items: this.cartService.toOrderItems(),
    };
    this.api.post<any>('orders', order).subscribe({
      next: (created) => {
        this.lastOrder = created;
        this.cartService.clear();
        this.toastr.success(`Order #${created.orderSerialNo} placed!`);
        this.placing = false;
      },
      error: () => { this.placing = false; },
    });
  }
}
