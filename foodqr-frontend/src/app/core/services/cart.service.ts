import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Item, ItemVariation } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] { return this.cartSubject.value; }
  get count(): number { return this.items.reduce((sum, i) => sum + i.quantity, 0); }
  get total(): number { return this.items.reduce((sum, i) => sum + this.getItemPrice(i) * i.quantity, 0); }
  get isEmpty(): boolean { return this.items.length === 0; }

  getItemPrice(cartItem: CartItem): number {
    const base = cartItem.variation
      ? cartItem.variation.price || (Number(cartItem.item.price) + Number(cartItem.variation.additionalPrice))
      : Number(cartItem.item.price);
    const extrasTotal = (cartItem.extras || []).reduce((sum, e) => sum + Number(e.price || 0), 0);
    return base + extrasTotal;
  }

  addItem(item: Item, quantity = 1, variation?: ItemVariation, specialNote?: string, extras?: any[]): void {
    const current = [...this.items];
    // Customized items (with extras or a note) are always added as a new line so
    // each customization keeps its own price/quantity instead of merging into an
    // existing identical-looking cart line.
    const existingIndex = (extras?.length || specialNote)
      ? -1
      : current.findIndex((i) => i.item.id === item.id && i.variation?.id === variation?.id && !i.extras?.length && !i.specialNote);
    if (existingIndex > -1) {
      current[existingIndex] = { ...current[existingIndex], quantity: current[existingIndex].quantity + quantity };
    } else {
      current.push({ item, variation, quantity, specialNote, extras });
    }
    this.cartSubject.next(current);
  }

  updateQuantity(itemId: string, variationId: string | undefined, quantity: number): void {
    if (quantity <= 0) { this.removeItem(itemId, variationId); return; }
    const current = this.items.map((i) =>
      i.item.id === itemId && i.variation?.id === variationId ? { ...i, quantity } : i
    );
    this.cartSubject.next(current);
  }

  removeItem(itemId: string, variationId: string | undefined): void {
    this.cartSubject.next(this.items.filter(
      (i) => !(i.item.id === itemId && i.variation?.id === variationId)
    ));
  }

  clear(): void { this.cartSubject.next([]); }

  toOrderItems(): any[] {
    return this.items.map((i) => ({
      itemId: i.item.id,
      variationId: i.variation?.id,
      quantity: i.quantity,
      specialNote: i.specialNote,
      extras: i.extras,
    }));
  }
}
