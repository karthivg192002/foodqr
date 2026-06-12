import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

interface SettingsTab { key: string; label: string; icon: string; group: string; }

@Component({ selector: 'app-settings', templateUrl: './settings.component.html' })
export class SettingsComponent implements OnInit {
  activeTab = 'company';
  loading = false;
  saving = false;

  companySettings: any = {};
  businessSettings: any = {};
  orderSettings: any = {};
  notificationSettings: any = {};
  mailSettings: any = {};
  paymentSettings: any = {};
  smsSettings: any = {};

  tabs: SettingsTab[] = [
    { key: 'company',      label: 'Company',       icon: 'building', group: 'company'      },
    { key: 'business',     label: 'Business',      icon: 'cog',      group: 'business'     },
    { key: 'order',        label: 'Orders',        icon: 'orders',   group: 'order'        },
    { key: 'notification', label: 'Notifications', icon: 'bell',     group: 'notification' },
    { key: 'mail',         label: 'Email / SMTP',  icon: 'mail',     group: 'mail'         },
    { key: 'payment',      label: 'Payment',       icon: 'card',     group: 'payment'      },
    { key: 'sms',          label: 'SMS',           icon: 'sms',      group: 'sms'          },
  ];

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.api.get<any>('admin/settings/company').subscribe({ next: (d) => { this.companySettings = d ?? {}; this.loading = false; }, error: () => { this.loading = false; } });
    this.api.get<any>('admin/settings/business').subscribe({ next: (d) => this.businessSettings = d ?? {} });
    this.api.get<any>('admin/settings/order').subscribe({ next: (d) => this.orderSettings = d ?? {} });
    this.api.get<any>('admin/settings/notification').subscribe({ next: (d) => this.notificationSettings = d ?? {} });
    this.api.get<any>('admin/settings/mail').subscribe({ next: (d) => this.mailSettings = d ?? {} });
    this.api.get<any>('admin/settings/payment').subscribe({ next: (d) => this.paymentSettings = d ?? {} });
    this.api.get<any>('admin/settings/sms').subscribe({ next: (d) => this.smsSettings = d ?? {} });
  }

  dataFor(group: string): any {
    const map: Record<string, any> = {
      company: this.companySettings,
      business: this.businessSettings,
      order: this.orderSettings,
      notification: this.notificationSettings,
      mail: this.mailSettings,
      payment: this.paymentSettings,
      sms: this.smsSettings,
    };
    return map[group] ?? {};
  }

  save(group: string): void {
    this.saving = true;
    this.api.post(`admin/settings/${group}`, this.dataFor(group)).subscribe({
      next: () => { this.toastr.success('Settings saved'); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }
}
