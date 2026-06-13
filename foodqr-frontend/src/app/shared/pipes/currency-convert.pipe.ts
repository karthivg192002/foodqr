import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({ name: 'fqrCurrency', pure: false })
export class CurrencyConvertPipe implements PipeTransform {
  constructor(private currencyService: CurrencyService) {}

  transform(value: number | string): string {
    return this.currencyService.format(Number(value) || 0);
  }
}
