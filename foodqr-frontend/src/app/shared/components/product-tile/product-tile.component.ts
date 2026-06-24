import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from '../../../core/models';

/**
 * The item-with-image/name/description/price/add-button markup repeated across the customer home
 * ("Recommended for You" carousel) and full menu (alternating list rows) pages. `layout="card"` gives
 * the vertical carousel tile, `layout="row"` the horizontal list row; `reverse` flips the row's image
 * to the right, matching the menu page's alternating layout.
 */
@Component({
  selector: 'app-product-tile',
  template: `
    <div *ngIf="layout === 'card'"
      (click)="select.emit()"
      class="w-56 shrink-0 bg-cust-surface-container-lowest rounded-2xl shadow-cust-card overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
      <div class="w-full h-36 bg-cust-surface-container relative">
        <img *ngIf="item.thumbImage" [src]="item.thumbImage" class="w-full h-full object-cover">
        <div *ngIf="!item.thumbImage" class="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
      </div>
      <div class="p-3.5">
        <h4 class="font-work font-semibold text-cust-on-surface truncate">{{ item.name }}</h4>
        <p class="text-cust-secondary text-xs mt-0.5 line-clamp-1">{{ item.description }}</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="font-jakarta font-bold text-cust-on-surface">{{ item.price | fqrCurrency }}</span>
          <button (click)="addToCart.emit($event)"
            class="w-9 h-9 rounded-full border-2 border-cust-primary-container text-cust-primary-container flex items-center justify-center hover:bg-cust-primary-container hover:text-white transition-colors">
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="layout === 'row'"
      (click)="select.emit()"
      [class.flex-row-reverse]="reverse"
      class="bg-cust-surface-container-lowest rounded-2xl shadow-cust-card flex overflow-hidden p-3 gap-4 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.99]">
      <div class="w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-cust-surface-container">
        <img *ngIf="item.thumbImage" [src]="item.thumbImage" class="w-full h-full object-cover">
        <div *ngIf="!item.thumbImage" class="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
      </div>
      <div class="flex flex-col justify-between flex-grow min-w-0">
        <div>
          <h3 class="font-jakarta font-bold text-cust-on-surface leading-tight truncate">{{ item.name }}</h3>
          <p class="text-cust-secondary text-sm line-clamp-2 mt-1">{{ item.description }}</p>
        </div>
        <div class="flex justify-between items-center mt-2">
          <span class="font-jakarta font-bold text-cust-primary">{{ item.price | fqrCurrency }}</span>
          <button (click)="addToCart.emit($event)"
            class="w-9 h-9 rounded-full border-2 border-cust-primary-container text-cust-primary-container flex items-center justify-center active:bg-cust-primary-container active:text-white transition-all">
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductTileComponent {
  @Input() item!: Item;
  @Input() layout: 'card' | 'row' = 'card';
  @Input() reverse = false;
  @Output() select = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Event>();
}
