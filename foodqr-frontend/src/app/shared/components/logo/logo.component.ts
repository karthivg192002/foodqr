import { Component, Input } from '@angular/core';
import { ThemeService, BrandingState } from '../../../core/services/theme.service';

@Component({
  selector: 'app-logo',
  template: `
    <div class="flex items-center gap-3">
      <ng-container *ngIf="(branding$ | async) as branding">
        <img *ngIf="branding.logoUrl" [src]="branding.logoUrl" [alt]="branding.productName"
          [style.width.px]="iconSize" [style.height.px]="iconSize" class="rounded-xl object-contain">
        <div *ngIf="!branding.logoUrl" [style.width.px]="iconSize" [style.height.px]="iconSize"
          class="bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="text-white" [style.width.px]="iconSize * 0.55" [style.height.px]="iconSize * 0.55"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <span *ngIf="showName" [ngClass]="nameClass" [style]="nameStyle">{{ branding.productName }}</span>
      </ng-container>
    </div>
  `,
})
export class LogoComponent {
  @Input() iconSize = 36;
  @Input() showName = true;
  @Input() nameClass = 'font-bold text-xl text-gray-900';
  @Input() nameStyle = '';

  branding$ = this.themeService.branding$;

  constructor(private themeService: ThemeService) {}
}
