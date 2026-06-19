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

  // POS cash change calculator
  receivedAmount = 0;
  get orderTotal(): number { return this.cartService.total; }
  get changeAmount(): number { return Math.max(0, this.receivedAmount - this.orderTotal); }
  get isSufficient(): boolean { return this.receivedAmount >= this.orderTotal; }

  // Quick customer creation
  showCustomerForm = false;
  posCustomer: any = null;
  customerSaving = false;
  customerForm = { name: '', phone: '', email: '' };

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
      next: (res) => { this.items = Array.isArray(res) ? res : (res.data ?? []); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  addToCart(item: Item): void { this.cartService.addItem(item); }

  getCartQty(itemId: string): number {
    return this.cartService.items.filter((i) => i.item.id === itemId).reduce((s, i) => s + i.quantity, 0);
  }

  getItemPrice(cartItem: CartItem): number { return this.cartService.getItemPrice(cartItem); }

  createPosCustomer(): void {
    if (!this.customerForm.name.trim()) { this.toastr.warning('Customer name is required'); return; }
    this.customerSaving = true;
    this.api.post<any>('auth/pos/customer', this.customerForm).subscribe({
      next: (customer) => {
        this.posCustomer = customer;
        this.customerSaving = false;
        this.showCustomerForm = false;
        this.customerForm = { name: '', phone: '', email: '' };
        this.toastr.success(`Customer "${customer.name}" added`);
      },
      error: () => { this.customerSaving = false; },
    });
  }

  placeOrder(): void {
    if (this.cartService.isEmpty) return;
    if (this.paymentMethod === PaymentMethod.CASH_ON_DELIVERY && !this.isSufficient) {
      this.toastr.warning('Received amount is less than order total');
      return;
    }
    this.placing = true;
    const order: any = {
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      paymentGateway: this.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY && this.paymentMethod !== PaymentMethod.E_WALLET
        ? this.paymentMethod
        : null,
      items: this.cartService.toOrderItems(),
      posReceivedAmount: this.receivedAmount,
    };
    if (this.posCustomer) order.customerId = this.posCustomer.id;
    this.api.post<any>('orders', order).subscribe({
      next: (created) => {
        this.lastOrder = created;
        this.cartService.clear();
        this.receivedAmount = 0;
        this.posCustomer = null;
        this.toastr.success(`Order #${created.orderSerialNo} placed!`);
        this.placing = false;
      },
      error: () => { this.placing = false; },
    });
  }

  paymentLabel(value?: string | null): string {
    const labels: Record<string, string> = {
      cash_on_delivery: 'Cash',
      e_wallet: 'Wallet',
      stripe: 'Card',
    };
    return value ? (labels[value] || value.replace(/_/g, ' ')) : 'N/A';
  }
}
