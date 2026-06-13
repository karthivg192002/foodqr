import { Component, OnInit } from '@angular/core';
import { CurrencyService, CurrencyRate } from '../../core/services/currency.service';

@Component({
  selector: 'app-currency-selector',
  template: `
    <select *ngIf="currencies.length > 1"
      [ngModel]="selected?.code"
      (ngModelChange)="onChange($event)"
      class="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white outline-none focus:border-orange-400">
      <option *ngFor="let c of currencies" [value]="c.code">{{ c.symbol }} {{ c.code }}</option>
    </select>
  `,
})
export class CurrencySelectorComponent implements OnInit {
  currencies: CurrencyRate[] = [];
  selected: CurrencyRate | null = null;

  constructor(public currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.currencies = this.currencyService.getCurrencies();
    this.currencyService.selected$.subscribe((c) => { this.selected = c; });
  }

  onChange(code: string): void {
    const c = this.currencies.find((x) => x.code === code);
    if (c) this.currencyService.select(c);
  }
}
