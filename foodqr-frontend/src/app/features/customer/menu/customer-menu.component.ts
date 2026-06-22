import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { Item, ItemCategory } from '../../../core/models';

interface MenuSection {
  heading: string;
  items: Item[];
}

@Component({
  selector: 'app-customer-menu',
  templateUrl: './customer-menu.component.html',
})
export class CustomerMenuComponent implements OnInit {
  categories: ItemCategory[] = [];
  selectedCategoryId = '';
  search = '';
  loading = false;
  sections: MenuSection[] = [];

  constructor(
    private api: ApiService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.selectedCategoryId = params.get('category') || '';
    this.search = params.get('search') || '';
    this.loadCategories();
    this.loadItems();
  }

  loadCategories(): void {
    this.api.get<ItemCategory[]>('frontend/categories').subscribe({ next: (d) => (this.categories = d || []) });
  }

  selectCategory(catId: string): void {
    this.selectedCategoryId = catId;
    this.loadItems();
  }

  onSearchChange(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    const params: any = { limit: 100 };
    if (this.search) params.search = this.search;
    if (this.selectedCategoryId) params.categoryId = this.selectedCategoryId;
    this.api.get<any>('frontend/items', params).subscribe({
      next: (res) => {
        const items: Item[] = Array.isArray(res) ? res : (res.data ?? []);
        this.sections = this.groupByCategory(items);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private groupByCategory(items: Item[]): MenuSection[] {
    const map = new Map<string, MenuSection>();
    for (const item of items) {
      const heading = item.category?.name || 'Menu';
      if (!map.has(heading)) map.set(heading, { heading, items: [] });
      map.get(heading)!.items.push(item);
    }
    return Array.from(map.values());
  }

  goToItem(item: Item): void {
    this.router.navigate(['/customer/item', item.id]);
  }

  addToCart(item: Item, event?: Event): void {
    event?.stopPropagation();
    this.cartService.addItem(item);
    this.toastr.success(`${item.name} added to cart`);
  }
}
