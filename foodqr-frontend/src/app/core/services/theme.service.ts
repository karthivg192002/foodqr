import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private api: ApiService) {}

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
    if (settings['favicon']) {
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link) link.href = settings['favicon'];
    }
  }
}
