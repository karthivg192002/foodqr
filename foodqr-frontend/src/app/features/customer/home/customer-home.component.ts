import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { Item, ItemCategory, Banner, Offer } from '../../../core/models';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
})
export class CustomerHomeComponent implements OnInit {
  categories: ItemCategory[] = [];
  subCategories: ItemCategory[] = [];
  featuredItems: Item[] = [];
  popularItems: Item[] = [];
  allItems: Item[] = [];
  banners: Banner[] = [];
  offers: Offer[] = [];
  selectedCategory = '';
  selectedSubCategory = '';
  search = '';
  loading = false;

  constructor(
    private api: ApiService,
    public cartService: CartService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeatured();
    this.loadPopular();
    this.loadBanners();
    this.loadOffers();
    this.loadItems();
  }

  loadCategories(): void {
    this.api.get<ItemCategory[]>('frontend/categories').subscribe({ next: (d) => this.categories = d });
  }

  loadFeatured(): void {
    this.api.get<Item[]>('frontend/items/featured').subscribe({ next: (d) => this.featuredItems = d });
  }

  loadPopular(): void {
    this.api.get<Item[]>('frontend/items/popular').subscribe({ next: (d) => this.popularItems = d });
  }

  loadBanners(): void {
    this.api.get<Banner[]>('frontend/banners').subscribe({ next: (d) => this.banners = d });
  }

  loadOffers(): void {
    this.api.get<Offer[]>('frontend/offers').subscribe({ next: (d) => this.offers = d });
  }

  loadItems(): void {
    this.loading = true;
    const params: any = { limit: 30 };
    if (this.search) params.search = this.search;
    // Prefer sub-category filter when selected, otherwise use parent
    const filterCat = this.selectedSubCategory || this.selectedCategory;
    if (filterCat) params.categoryId = filterCat;
    this.api.get<any>('frontend/items', params).subscribe({
      next: (res) => { this.allItems = Array.isArray(res) ? res : (res.data ?? []); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  addToCart(item: Item): void {
    this.cartService.addItem(item);
    this.toastr.success(`${item.name} added to cart`);
  }

  getCartQty(itemId: string): number {
    return this.cartService.items.filter((i) => i.item.id === itemId).reduce((sum, i) => sum + i.quantity, 0);
  }

  selectCategory(catId: string): void {
    if (this.selectedCategory === catId) {
      this.selectedCategory = '';
      this.subCategories = [];
      this.selectedSubCategory = '';
    } else {
      this.selectedCategory = catId;
      this.selectedSubCategory = '';
      const cat = this.categories.find((c) => c.id === catId);
      this.subCategories = cat?.children || [];
    }
    this.loadItems();
  }

  selectSubCategory(subId: string): void {
    this.selectedSubCategory = this.selectedSubCategory === subId ? '' : subId;
    this.loadItems();
  }
}
