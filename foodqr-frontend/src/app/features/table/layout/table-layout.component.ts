import { Component } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-table-layout',
  template: `
    <div class="min-h-screen bg-gray-50 flex">

      <!-- Desktop sidebar -->
      <aside class="hidden lg:flex lg:flex-col flex-shrink-0 w-60 min-h-screen bg-white border-r border-gray-200 sticky top-0">
        <div class="h-16 flex items-center gap-2 px-5 border-b border-gray-100">
          <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-white text-sm font-bold">FQ</span>
          </div>
          <span class="font-bold text-gray-900 truncate">Table Order</span>
        </div>
        <nav class="flex-1 py-4 px-3 space-y-1">
          <a [routerLink]="menuRoute" routerLinkActive="bg-orange-50 text-orange-600"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            Menu
          </a>
          <a [routerLink]="cartRoute" routerLinkActive="bg-orange-50 text-orange-600"
            class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Cart
            </span>
            <span *ngIf="cartService.count > 0" class="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{{ cartService.count }}</span>
          </a>
        </nav>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Mobile + desktop top bar -->
        <header class="bg-white border-b sticky top-0 z-50">
          <div class="max-w-3xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
            <div class="flex items-center gap-2 lg:hidden">
              <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-sm font-bold">FQ</span>
              </div>
              <span class="font-bold text-gray-900">Table Order</span>
            </div>
            <span class="hidden lg:block text-sm font-medium text-gray-500">Browse the menu and order from your table</span>
            <a [routerLink]="cartRoute" class="relative lg:hidden">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span *ngIf="cartService.count > 0" class="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{{ cartService.count }}</span>
            </a>
          </div>
        </header>
        <main class="flex-1 max-w-3xl mx-auto w-full lg:px-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class TableLayoutComponent {
  get slug(): string {
    return window.location.pathname.split('/')[2];
  }
  get menuRoute(): string {
    return `/table/${this.slug}/menu`;
  }
  get cartRoute(): string {
    return `/table/${this.slug}/cart`;
  }
  constructor(public cartService: CartService) {}
}
