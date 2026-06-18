import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { Item, ItemCategory } from '../../../core/models';

@Component({
  selector: 'app-table-menu',
  templateUrl: './table-menu.component.html',
})
export class TableMenuComponent implements OnInit {
  slug = '';
  categories: ItemCategory[] = [];
  items: Item[] = [];
  selectedCategory = '';
  search = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public cartService: CartService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug')!;
    this.loadCategories();
    this.loadItems();
  }

  loadCategories(): void {
    this.api.get<ItemCategory[]>('frontend/categories').subscribe({ next: (d) => this.categories = d });
  }

  loadItems(): void {
    this.loading = true;
    const params: any = { limit: 50 };
    if (this.search) params.search = this.search;
    if (this.selectedCategory) params.categoryId = this.selectedCategory;
    this.api.get<any>('frontend/items', params).subscribe({
      next: (res) => { this.items = Array.isArray(res) ? res : (res.data ?? []); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  addToCart(item: Item): void {
    this.cartService.addItem(item);
    this.toastr.success(`${item.name} added`);
  }

  getCartQty(itemId: string): number {
    return this.cartService.items.filter((i) => i.item.id === itemId).reduce((s, i) => s + i.quantity, 0);
  }

  goToCart(): void {
    this.router.navigate(['/table', this.slug, 'cart']);
  }
}
