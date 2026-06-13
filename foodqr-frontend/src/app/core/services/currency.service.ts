import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface CurrencyRate {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly STORAGE_KEY = 'fqr_currency';
  private currencies: CurrencyRate[] = [];
  private activeCurrency$ = new BehaviorSubject<CurrencyRate | null>(null);

  readonly selected$ = this.activeCurrency$.asObservable();

  constructor(private api: ApiService) {
    this.load();
  }

  get selected(): CurrencyRate | null { return this.activeCurrency$.value; }
  get symbol(): string { return this.selected?.symbol || '$'; }
  get code(): string { return this.selected?.code || 'USD'; }

  private load(): void {
    this.api.get<CurrencyRate[]>('frontend/currencies').subscribe({
      next: (list) => {
        this.currencies = list;
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const match = saved ? list.find((c) => c.code === saved) : null;
        const def = list.find((c) => c.isDefault) || list[0];
        this.activeCurrency$.next(match || def || null);
      },
    });
  }

  getCurrencies(): CurrencyRate[] { return this.currencies; }

  select(currency: CurrencyRate): void {
    localStorage.setItem(this.STORAGE_KEY, currency.code);
    this.activeCurrency$.next(currency);
  }

  /** Convert a base-currency amount to the currently selected currency */
  convert(amount: number): number {
    if (!this.selected || this.selected.isDefault) return amount;
    return Math.round(amount * Number(this.selected.exchangeRate) * 100) / 100;
  }

  format(amount: number): string {
    return `${this.symbol}${this.convert(amount).toFixed(2)}`;
  }
}
