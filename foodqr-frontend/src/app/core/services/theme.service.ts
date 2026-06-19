import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface BrandingState {
  logoUrl: string | null;
  faviconUrl: string | null;
  productName: string;
  footerCredit: string;
}

const DEFAULT_BRANDING: BrandingState = {
  logoUrl: null,
  faviconUrl: null,
  productName: 'FoodQR',
  footerCredit: '© 2025 FoodQR. All rights reserved.',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private brandingSubject = new BehaviorSubject<BrandingState>(DEFAULT_BRANDING);
  readonly branding$ = this.brandingSubject.asObservable();

  constructor(private api: ApiService, private titleService: Title) {}

  loadAndApply(): void {
    this.api.get<Record<string, string>>('admin/settings/public').subscribe({
      next: (settings) => this.apply(settings),
      error: () => {},
    });
  }

  apply(settings: Record<string, string>): void {
    const root = document.documentElement.style;
    if (settings['primary_color']) {
      root.setProperty('--brand', settings['primary_color']);
      root.setProperty('--sidebar-active', settings['primary_color']);
    }
    if (settings['secondary_color']) {
      root.setProperty('--sidebar-bg', settings['secondary_color']);
    }
    if (settings['font_family']) {
      document.body.style.fontFamily = settings['font_family'];
    }

    const current = this.brandingSubject.value;
    const next: BrandingState = {
      logoUrl: settings['logo'] || current.logoUrl,
      faviconUrl: settings['favicon'] || current.faviconUrl,
      productName: settings['product_name'] || current.productName,
      footerCredit: settings['footer_credit'] || current.footerCredit,
    };
    this.brandingSubject.next(next);

    if (next.faviconUrl) {
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link) link.href = next.faviconUrl;
    }
    this.titleService.setTitle(`${next.productName} - Restaurant Management`);
  }

  get currentBranding(): BrandingState {
    return this.brandingSubject.value;
  }
}
