import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { Item, ItemExtra, ItemVariation } from '../../../core/models';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
})
export class ItemDetailsComponent implements OnInit {
  item: Item | null = null;
  extras: ItemExtra[] = [];
  loading = false;

  selectedExtraIds = new Set<string>();
  selectedVariationId = '';
  specialNote = '';
  quantity = 1;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cartService: CartService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/customer/home']); return; }
    this.loading = true;
    this.api.get<Item>(`frontend/items/${id}`).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
        if (item.variations?.length) this.selectedVariationId = item.variations[0].id;
      },
      error: () => { this.loading = false; },
    });
    this.api.get<ItemExtra[]>(`frontend/items/${id}/extras`).subscribe({ next: (d) => (this.extras = d || []) });
  }

  get ingredients(): string[] {
    return (this.item?.ingredients || '').split(',').map((s) => s.trim()).filter(Boolean);
  }

  get selectedVariation(): ItemVariation | undefined {
    return this.item?.variations?.find((v) => v.id === this.selectedVariationId);
  }

  toggleExtra(extraId: string): void {
    if (this.selectedExtraIds.has(extraId)) this.selectedExtraIds.delete(extraId);
    else this.selectedExtraIds.add(extraId);
  }

  get unitPrice(): number {
    if (!this.item) return 0;
    const variation = this.selectedVariation;
    const base = variation ? (variation.price || Number(this.item.price) + Number(variation.additionalPrice)) : Number(this.item.price);
    const extrasTotal = this.extras
      .filter((e) => this.selectedExtraIds.has(e.id))
      .reduce((sum, e) => sum + Number(e.price), 0);
    return base + extrasTotal;
  }

  get lineTotal(): number {
    return this.unitPrice * this.quantity;
  }

  incrementQty(): void { this.quantity++; }
  decrementQty(): void { if (this.quantity > 1) this.quantity--; }

  goBack(): void { this.location.back(); }

  addToCart(): void {
    if (!this.item) return;
    const extras = this.extras
      .filter((e) => this.selectedExtraIds.has(e.id))
      .map((e) => ({ id: e.id, name: e.name, price: e.price }));
    this.cartService.addItem(this.item, this.quantity, this.selectedVariation, this.specialNote || undefined, extras);
    this.toastr.success(`${this.item.name} added to cart`);
    this.router.navigate(['/customer/cart']);
  }
}
