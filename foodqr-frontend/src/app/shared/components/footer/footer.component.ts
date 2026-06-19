import { Component, Input } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-footer',
  template: `
    <p [ngClass]="textClass">{{ (branding$ | async)?.footerCredit }}</p>
  `,
})
export class FooterComponent {
  @Input() textClass = 'text-slate-600 text-xs';

  branding$ = this.themeService.branding$;

  constructor(private themeService: ThemeService) {}
}
