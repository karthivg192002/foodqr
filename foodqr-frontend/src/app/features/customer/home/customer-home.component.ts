import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { Item, ItemCategory, Banner, Offer, PromotionBanner } from '../../../core/models';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
})
export class CustomerHomeComponent implements OnInit {
  categories: ItemCategory[] = [];
  featuredItems: Item[] = [];
  popularItems: Item[] = [];
  banners: Banner[] = [];
  offers: Offer[] = [];
  promotionBanners: PromotionBanner[] = [];
  search = '';

  constructor(
    private api: ApiService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeatured();
    this.loadPopular();
    this.loadBanners();
    this.loadOffers();
    this.loadPromotionBanners();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }

  loadCategories(): void {
    const params: any = {};
    if (this.cartService.branchId) params.branchId = this.cartService.branchId;
    this.api.get<ItemCategory[]>('frontend/categories', params).subscribe({ next: (d) => (this.categories = d || []) });
  }

  loadFeatured(): void {
    this.api.get<Item[]>('frontend/items/featured').subscribe({ next: (d) => (this.featuredItems = d || []) });
  }

  loadPopular(): void {
    this.api.get<Item[]>('frontend/items/popular').subscribe({ next: (d) => (this.popularItems = d || []) });
  }

  loadBanners(): void {
    this.api.get<Banner[]>('frontend/banners').subscribe({ next: (d) => (this.banners = d || []) });
  }

  loadOffers(): void {
    this.api.get<Offer[]>('frontend/offers').subscribe({ next: (d) => (this.offers = d || []) });
  }

  loadPromotionBanners(): void {
    this.api.get<PromotionBanner[]>('frontend/promotion-banners').subscribe({ next: (d) => (this.promotionBanners = d || []) });
  }

  submitSearch(): void {
    this.router.navigate(['/customer/menu'], this.search ? { queryParams: { search: this.search } } : {});
  }

  goToCategory(catId: string): void {
    this.router.navigate(['/customer/menu'], { queryParams: { category: catId } });
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
