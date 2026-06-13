import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-payment-gateways', templateUrl: './payment-gateways.component.html' })
export class PaymentGatewaysComponent implements OnInit {
  gateways: any[] = [];
  loading = false;
  selectedGateway: any = null;
  configJson = '';
  saving = false;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<any[]>('admin/payment-gateways').subscribe({
      next: (d) => { this.gateways = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openConfig(gw: any): void {
    this.selectedGateway = { ...gw };
    this.configJson = JSON.stringify(gw.config || {}, null, 2);
  }

  toggle(gw: any): void {
    this.api.patch(`admin/payment-gateways/${gw.slug}`, { isActive: !gw.isActive }).subscribe({
      next: () => { this.toastr.success('Updated'); this.load(); },
    });
  }

  saveConfig(): void {
    this.saving = true;
    let config: any = {};
    try { config = JSON.parse(this.configJson); } catch { this.toastr.error('Invalid JSON'); this.saving = false; return; }

    this.api.patch(`admin/payment-gateways/${this.selectedGateway.slug}`, {
      isActive: this.selectedGateway.isActive,
      mode: this.selectedGateway.mode,
      config,
    }).subscribe({
      next: () => { this.toastr.success('Gateway settings saved'); this.selectedGateway = null; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  getGatewayIcon(slug: string): string {
    const icons: Record<string, string> = { stripe: '💳', paypal: '🅿️', razorpay: '🪙', cashfree: '💰', mollie: '🔵', flutterwave: '🌊', paystack: '💚', phonepe: '📱', paytm: '📲', bkash: '🔴' };
    return icons[slug] || '💳';
  }
}
