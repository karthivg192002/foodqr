import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencySelectorComponent } from './currency-selector/currency-selector.component';
import { CurrencyConvertPipe } from './pipes/currency-convert.pipe';
import { LogoComponent } from './components/logo/logo.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductTileComponent } from './components/product-tile/product-tile.component';

@NgModule({
  declarations: [CurrencySelectorComponent, CurrencyConvertPipe, LogoComponent, FooterComponent, ProductTileComponent],
  imports: [CommonModule, FormsModule],
  exports: [CurrencySelectorComponent, CurrencyConvertPipe, LogoComponent, FooterComponent, ProductTileComponent],
})
export class SharedModule {}
