import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencySelectorComponent } from './currency-selector/currency-selector.component';
import { CurrencyConvertPipe } from './pipes/currency-convert.pipe';

@NgModule({
  declarations: [CurrencySelectorComponent, CurrencyConvertPipe],
  imports: [CommonModule, FormsModule],
  exports: [CurrencySelectorComponent, CurrencyConvertPipe],
})
export class SharedModule {}
