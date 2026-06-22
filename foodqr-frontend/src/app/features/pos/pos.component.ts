import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Item, ItemCategory, OrderType, PaymentMethod, CartItem, DiningTable } from '../../core/models';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
})
export class PosComponent implements OnInit, OnDestroy {
  categories: ItemCategory[] = [];
  items: Item[] = [];
  selectedCategory = '';
  search = '';
  loading = false;
  placing = false;
  orderType = OrderType.POS;
  PaymentMethod = PaymentMethod;
  OrderType = OrderType;

  // Tables
  tables: DiningTable[] = [];
  selectedTableId = '';
  showTableDropdown = false;

  // Payment gateways (loaded from backend)
  activeGateways: { name: string; slug: string; isUpi: boolean; config?: any }[] = [];
  selectedGateway = 'cash';

  // Discount
  discountType: 'percentage' | 'fixed' = 'percentage';
  discountInput = '';
  appliedDiscount = 0;
  showDiscountMenu = false;

  // Payment modal
  showPaymentModal = false;
  receivedAmount = '';
  cardReference = '';

  // Order success (shows token + receipt)
  lastOrder: any = null;
  receiptItems: { name: string; qty: number; unitPrice: number; total: number }[] = [];
  receiptCustomerName = '';
  receiptTableLabel = '';
  receiptPaymentLabel = '';

  // Reactive cart snapshot (kept in sync with cart$ for proper CD)
  cartItems: CartItem[] = [];
  private cartSub?: Subscription;

  // Customer
  showCustomerForm = false;
  posCustomer: any = null;
  customerSaving = false;
  customerForm = { name: '', phone: '', email: '' };

  // ─── Computed ──────────────────────────────────
  get subtotal(): number { return this.cartService.total; }
  get orderTotal(): number { return Math.max(0, this.subtotal - this.appliedDiscount); }
  get receivedNum(): number { return parseFloat(this.receivedAmount) || 0; }
  get change(): number { return Math.max(0, this.receivedNum - this.orderTotal); }
  get isSufficient(): boolean { return this.receivedNum >= this.orderTotal; }

  get selectedTableName(): string {
    return this.tables.find(t => t.id === this.selectedTableId)?.name ?? 'Select Table';
  }

  get isCash(): boolean { return this.selectedGateway === 'cash'; }

  get isUpiSelected(): boolean {
    return !!this.activeGateways.find(g => g.slug === this.selectedGateway)?.isUpi;
  }

  get upiQrUrl(): string {
    const gw = this.activeGateways.find(g => g.slug === this.selectedGateway);
    const vpa = gw?.config?.vpa || gw?.config?.merchantVpa || '';
    if (!vpa) return '';
    const upiUrl = `upi://pay?pa=${vpa}&pn=FoodQR&am=${this.orderTotal.toFixed(2)}&tn=Order+Payment&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;
  }

  constructor(
    public cartService: CartService,
    private api: ApiService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe(items => { this.cartItems = items; });
    this.loadCategories();
    this.loadItems();
    this.loadTables();
    this.loadPaymentGateways();
  }

  ngOnDestroy(): void { this.cartSub?.unsubscribe(); }

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

  loadTables(): void {
    this.api.get<any>('admin/dining-tables').subscribe({
      next: (res) => { this.tables = Array.isArray(res) ? res : (res.data ?? []); },
      error: () => {},
    });
  }

  loadPaymentGateways(): void {
    const upiSlugs = ['razorpay', 'cashfree', 'flutterwave', 'paystack', 'mollie'];
    this.api.get<any[]>('payment-gateways/active').subscribe({
      next: (gateways) => {
        this.activeGateways = [
          { name: 'Cash', slug: 'cash', isUpi: false },
          { name: 'Card', slug: 'card', isUpi: false },
          ...gateways.map(g => ({
            name: g.name,
            slug: g.slug,
            isUpi: upiSlugs.includes(g.slug),
            config: g.config,
          })),
        ];
      },
      error: () => {
        this.activeGateways = [
          { name: 'Cash', slug: 'cash', isUpi: false },
          { name: 'Card', slug: 'card', isUpi: false },
        ];
      },
    });
  }

  addToCart(item: Item): void { this.cartService.addItem(item); }

  getCartQty(id: string): number {
    return this.cartService.items.filter(i => i.item.id === id).reduce((s, i) => s + i.quantity, 0);
  }

  getItemPrice(ci: CartItem): number { return this.cartService.getItemPrice(ci); }

  applyDiscount(): void {
    const val = parseFloat(this.discountInput);
    if (!val || val <= 0) { this.appliedDiscount = 0; return; }
    this.appliedDiscount = this.discountType === 'percentage'
      ? Math.min((this.subtotal * val) / 100, this.subtotal)
      : Math.min(val, this.subtotal);
    this.showDiscountMenu = false;
  }

  clearDiscount(): void { this.appliedDiscount = 0; this.discountInput = ''; }

  numpad(key: string): void {
    if (key === '⌫') { this.receivedAmount = this.receivedAmount.slice(0, -1); return; }
    if (key === 'C') { this.receivedAmount = ''; return; }
    if (key === '.' && this.receivedAmount.includes('.')) return;
    this.receivedAmount = (this.receivedAmount + key).replace(/^0+(\d)/, '$1');
  }

  openPaymentModal(): void {
    if (!this.cartItems.length) return;
    if (this.orderType === OrderType.DINING_TABLE && !this.selectedTableId) {
      this.toastr.warning('Please select a table first');
      return;
    }
    this.receivedAmount = '';
    this.showPaymentModal = true;
  }

  confirmPayment(): void {
    if (this.isCash && !this.isSufficient) {
      this.toastr.warning('Received amount is less than total');
      return;
    }
    this.placeOrder();
  }

  placeOrder(): void {
    this.placing = true;
    const gw = this.selectedGateway;
    const pmMap: Record<string, string> = { cash: 'cash_on_delivery', card: 'stripe', stripe: 'stripe' };
    const paymentMethod = pmMap[gw] ?? gw;
    const body: any = {
      orderType: this.orderType,
      paymentMethod,
      paymentGateway: !['cash', 'card', 'cash_on_delivery', 'stripe'].includes(gw) ? gw : null,
      items: this.cartService.toOrderItems(),
      discount: this.appliedDiscount,
      posReceivedAmount: this.receivedNum,
    };
    if (this.orderType === OrderType.DINING_TABLE && this.selectedTableId) {
      body.diningTableId = this.selectedTableId;
    }
    if (this.posCustomer) body.customerId = this.posCustomer.id;

    // Snapshot cart before clearing (for receipt)
    this.receiptItems = this.cartService.items.map(ci => ({
      name: ci.item.name + (ci.variation ? ` (${ci.variation.name})` : ''),
      qty: ci.quantity,
      unitPrice: this.getItemPrice(ci),
      total: this.getItemPrice(ci) * ci.quantity,
    }));
    this.receiptCustomerName = this.posCustomer?.name ?? '';
    this.receiptTableLabel = this.orderType === OrderType.DINING_TABLE ? this.selectedTableName : '';
    this.receiptPaymentLabel = this.activeGateways.find(g => g.slug === gw)?.name ?? gw;

    this.api.post<any>('orders', body).subscribe({
      next: (order) => {
        this.lastOrder = order;
        this.cartService.clear();
        this.appliedDiscount = 0;
        this.discountInput = '';
        this.receivedAmount = '';
        this.cardReference = '';
        this.posCustomer = null;
        this.selectedTableId = '';
        this.showPaymentModal = false;
        this.placing = false;
      },
      error: () => { this.placing = false; },
    });
  }

  newOrder(): void { this.lastOrder = null; }

  printBill(): void {
    if (!this.lastOrder) return;
    const o = this.lastOrder;
    const d = new Date(o.createdAt || Date.now());
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const itemRows = this.receiptItems.map(item => `
      <tr>
        <td style="padding:5px 0;font-size:13px;vertical-align:top">${item.name}</td>
        <td style="text-align:center;padding:5px 0;font-size:13px;white-space:nowrap">×${item.qty}</td>
        <td style="text-align:right;padding:5px 0;font-size:13px;white-space:nowrap">₹${item.total.toFixed(2)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <title>Receipt #${o.orderSerialNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',Courier,monospace;width:320px;margin:0 auto;padding:16px 12px;font-size:13px;color:#111;background:#fff}
    .c{text-align:center} .b{font-weight:700} .dashed{border-top:1px dashed #aaa;margin:10px 0}
    table{width:100%;border-collapse:collapse}
    @media print{.no-print{display:none!important}}
  </style>
</head><body>
  <div class="c" style="margin-bottom:14px">
    <div style="font-size:20px;font-weight:900;letter-spacing:-0.5px">FoodQR</div>
    <div style="font-size:11px;color:#777;margin-top:2px">Point of Sale · Official Receipt</div>
  </div>

  <div class="dashed"></div>

  <div class="c" style="padding:12px 0">
    <div style="font-size:10px;font-weight:800;letter-spacing:4px;color:#aaa;text-transform:uppercase;margin-bottom:4px">TOKEN</div>
    <div style="font-size:64px;font-weight:900;color:#ea580c;line-height:1;letter-spacing:-2px">${o.dailyToken ?? '—'}</div>
    <div style="font-size:11px;color:#aaa;margin-top:4px">Call this token when order is ready</div>
  </div>

  <div class="dashed"></div>

  <table style="font-size:12px;line-height:2">
    <tr><td style="color:#888">Order No</td><td style="text-align:right;font-weight:700">#${o.orderSerialNo}</td></tr>
    <tr><td style="color:#888">Date</td><td style="text-align:right">${dateStr}</td></tr>
    <tr><td style="color:#888">Time</td><td style="text-align:right">${timeStr}</td></tr>
    <tr><td style="color:#888">Type</td><td style="text-align:right;text-transform:capitalize">${String(o.orderType || 'pos').replace('_',' ')}</td></tr>
    ${this.receiptTableLabel ? `<tr><td style="color:#888">Table</td><td style="text-align:right">${this.receiptTableLabel}</td></tr>` : ''}
    ${this.receiptCustomerName ? `<tr><td style="color:#888">Customer</td><td style="text-align:right">${this.receiptCustomerName}</td></tr>` : ''}
  </table>

  <div class="dashed"></div>

  <table>
    <thead>
      <tr style="font-size:11px;color:#888;text-transform:uppercase">
        <th style="text-align:left;padding-bottom:6px">Item</th>
        <th style="text-align:center;padding-bottom:6px">Qty</th>
        <th style="text-align:right;padding-bottom:6px">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="dashed"></div>

  <table style="font-size:13px">
    <tr><td style="padding:3px 0;color:#666">Subtotal</td><td style="text-align:right;padding:3px 0">₹${(+o.subtotal || 0).toFixed(2)}</td></tr>
    ${(+o.discount || 0) > 0 ? `<tr><td style="padding:3px 0;color:#16a34a">Discount</td><td style="text-align:right;padding:3px 0;color:#16a34a">−₹${(+o.discount).toFixed(2)}</td></tr>` : ''}
    <tr style="font-weight:900;font-size:15px">
      <td style="padding:8px 0 4px;border-top:1px dashed #aaa">TOTAL</td>
      <td style="text-align:right;padding:8px 0 4px;border-top:1px dashed #aaa">₹${(+o.total || 0).toFixed(2)}</td>
    </tr>
  </table>

  <div class="dashed"></div>

  <table style="font-size:12px;line-height:2">
    <tr><td style="color:#888">Payment</td><td style="text-align:right;font-weight:700;text-transform:capitalize">${this.receiptPaymentLabel}</td></tr>
    ${this.receivedNum > 0 ? `<tr><td style="color:#888">Cash Received</td><td style="text-align:right">₹${this.receivedNum.toFixed(2)}</td></tr>
    <tr><td style="color:#888">Change</td><td style="text-align:right">₹${this.change.toFixed(2)}</td></tr>` : ''}
  </table>

  <div class="dashed"></div>

  <div class="c" style="padding:12px 0;font-size:12px;color:#777;line-height:2">
    <div>Thank you for your visit!</div>
    <div>Please come again ♥</div>
    <div style="margin-top:6px;font-size:10px;color:#bbb">Powered by FoodQR</div>
  </div>

  <div class="no-print c" style="margin-top:16px">
    <button onclick="window.print()" style="padding:11px 28px;background:#ea580c;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px">
      🖨️ Print / Save PDF
    </button>
    <button onclick="window.close()" style="padding:11px 20px;background:#f1f5f9;color:#475569;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">
      Close
    </button>
  </div>
</body></html>`;

    const win = window.open('', '_blank', 'width=460,height=750,scrollbars=yes');
    if (!win) { this.toastr.warning('Allow popups to print the bill'); return; }
    win.document.write(html);
    win.document.close();
  }

  createPosCustomer(): void {
    if (!this.customerForm.name.trim()) { this.toastr.warning('Name is required'); return; }
    this.customerSaving = true;
    this.api.post<any>('auth/pos/customer', this.customerForm).subscribe({
      next: (c) => {
        this.posCustomer = c;
        this.customerSaving = false;
        this.showCustomerForm = false;
        this.customerForm = { name: '', phone: '', email: '' };
        this.toastr.success(`Customer "${c.name}" added`);
      },
      error: () => { this.customerSaving = false; },
    });
  }
}
