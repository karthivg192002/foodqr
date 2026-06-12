import { Component } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-table-layout',
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white border-b sticky top-0 z-50">
        <div class="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm font-bold">FQ</span>
            </div>
            <span class="font-bold text-gray-900">Table Order</span>
          </div>
          <a [routerLink]="cartRoute" class="relative">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span *ngIf="cartService.count > 0" class="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{{ cartService.count }}</span>
          </a>
        </div>
      </header>
      <main class="flex-1 max-w-lg mx-auto w-full">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class TableLayoutComponent {
  get cartRoute() {
    const slug = window.location.pathname.split('/')[2];
    return `/table/${slug}/cart`;
  }
  constructor(public cartService: CartService) {}
}
