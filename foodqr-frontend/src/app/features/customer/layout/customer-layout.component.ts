import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-customer-layout',
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">

      <!-- Header -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <app-logo [iconSize]="32" nameClass="font-extrabold text-gray-900 tracking-tight text-base"></app-logo>
            <nav class="hidden lg:flex items-center gap-1">
              <a routerLink="/customer/home" routerLinkActive #dHomeActive="routerLinkActive"
                class="px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                [class]="dHomeActive.isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">Home</a>
              <a routerLink="/customer/orders" routerLinkActive #dOrdersActive="routerLinkActive"
                class="px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                [class]="dOrdersActive.isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">Orders</a>
              <a routerLink="/customer/loyalty" routerLinkActive #dLoyaltyActive="routerLinkActive"
                class="px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                [class]="dLoyaltyActive.isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">Rewards</a>
              <a routerLink="/customer/dashboard" routerLinkActive #dProfileActive="routerLinkActive"
                class="px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                [class]="dProfileActive.isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">Profile</a>
            </nav>
          </div>
          <a routerLink="/customer/cart" class="relative p-2 hover:bg-orange-50 rounded-xl transition-colors">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span *ngIf="cartService.count > 0"
              class="absolute top-0.5 right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {{ cartService.count }}
            </span>
          </a>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 max-w-7xl mx-auto w-full lg:px-4">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Nav -->
      <nav class="bg-white border-t border-gray-100 sticky bottom-0 shadow-[0_-1px_8px_rgba(0,0,0,0.06)] lg:hidden">
        <div class="max-w-7xl mx-auto flex">

          <!-- Home -->
          <a routerLink="/customer/home" routerLinkActive #homeActive="routerLinkActive"
            class="flex-1 flex flex-col items-center py-2.5 transition-colors"
            [class]="homeActive.isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="text-[10px] mt-1 font-semibold">Home</span>
          </a>

          <!-- Orders -->
          <a routerLink="/customer/orders" routerLinkActive #ordersActive="routerLinkActive"
            class="flex-1 flex flex-col items-center py-2.5 transition-colors"
            [class]="ordersActive.isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <span class="text-[10px] mt-1 font-semibold">Orders</span>
          </a>

          <!-- Loyalty -->
          <a routerLink="/customer/loyalty" routerLinkActive #loyaltyActive="routerLinkActive"
            class="flex-1 flex flex-col items-center py-2.5 transition-colors"
            [class]="loyaltyActive.isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <span class="text-[10px] mt-1 font-semibold">Rewards</span>
          </a>

          <!-- Profile -->
          <a routerLink="/customer/dashboard" routerLinkActive #profileActive="routerLinkActive"
            class="flex-1 flex flex-col items-center py-2.5 transition-colors"
            [class]="profileActive.isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="text-[10px] mt-1 font-semibold">Profile</span>
          </a>

        </div>
      </nav>
    </div>
  `,
})
export class CustomerLayoutComponent {
  navItems = [
    { label: 'Home', icon: '🏠', route: '/customer/home' },
    { label: 'Orders', icon: '📋', route: '/customer/orders' },
    { label: 'Loyalty', icon: '⭐', route: '/customer/loyalty' },
    { label: 'Profile', icon: '👤', route: '/customer/profile' },
  ];

  constructor(public cartService: CartService, public authService: AuthService) {}
}
