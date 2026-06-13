import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Offer, Banner } from '../../../core/models';

@Component({ selector: 'app-offers', templateUrl: './offers.component.html' })
export class OffersComponent implements OnInit {
  offers: Offer[] = [];
  banners: Banner[] = [];
  activeTab: 'offers' | 'banners' = 'offers';
  loading = false;
  showForm = false;
  formType: 'offer' | 'banner' = 'offer';
  saving = false;
  formData: any = {};

  // Offer items management
  selectedOffer: any = null;
  offerItems: any[] = [];
  allItems: any[] = [];
  showItemModal = false;
  addItemId = '';

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadOffers();
    this.loadBanners();
    this.api.get<any>('frontend/items', { limit: 500 }).subscribe({ next: (r) => this.allItems = r.data || [] });
  }

  loadOffers(): void { this.api.get<Offer[]>('admin/offers').subscribe({ next: (d) => this.offers = d }); }
  loadBanners(): void { this.api.get<Banner[]>('admin/banners').subscribe({ next: (d) => this.banners = d }); }

  openNewOffer(): void { this.formType = 'offer'; this.formData = { status: true, discountType: 'fixed', discountAmount: 0 }; this.showForm = true; }
  openNewBanner(): void { this.formType = 'banner'; this.formData = { status: true }; this.showForm = true; }

  save(): void {
    this.saving = true;
    const endpoint = this.formType === 'offer' ? 'admin/offers' : 'admin/banners';
    this.api.post(endpoint, this.formData).subscribe({
      next: () => {
        this.toastr.success('Created'); this.showForm = false; this.saving = false;
        if (this.formType === 'offer') this.loadOffers(); else this.loadBanners();
      },
      error: () => { this.saving = false; },
    });
  }

  deleteOffer(id: string): void {
    if (!confirm('Delete?')) return;
    this.api.delete(`admin/offers/${id}`).subscribe({ next: () => { this.toastr.success('Deleted'); this.loadOffers(); } });
  }

  deleteBanner(id: string): void {
    if (!confirm('Delete?')) return;
    this.api.delete(`admin/banners/${id}`).subscribe({ next: () => { this.toastr.success('Deleted'); this.loadBanners(); } });
  }

  openOfferItems(offer: any): void {
    this.selectedOffer = offer;
    this.showItemModal = true;
    this.loadOfferItems();
  }

  loadOfferItems(): void {
    this.api.get<any[]>(`admin/offers/${this.selectedOffer.id}/items`).subscribe({
      next: (d) => { this.offerItems = d; },
    });
  }

  addItemToOffer(): void {
    if (!this.addItemId) return;
    this.api.post(`admin/offers/${this.selectedOffer.id}/items`, { itemId: this.addItemId }).subscribe({
      next: () => { this.toastr.success('Item added'); this.addItemId = ''; this.loadOfferItems(); },
    });
  }

  removeItemFromOffer(offerItemId: string): void {
    this.api.delete(`admin/offers/items/${offerItemId}`).subscribe({
      next: () => { this.toastr.success('Item removed'); this.loadOfferItems(); },
    });
  }
}
