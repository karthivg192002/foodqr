import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

interface SettingsTab { key: string; label: string; group: string; }

@Component({ selector: 'app-settings', templateUrl: './settings.component.html' })
export class SettingsComponent implements OnInit {
  activeTab = 'company';
  loading = false;
  saving = false;

  companySettings: any = {};
  siteSettings: any = {};
  orderSetupSettings: any = {};
  notificationSettings: any = {};
  mailSettings: any = {};
  paymentSettings: any = {};
  smsSettings: any = {};
  socialSettings: any = {};
  themeSettings: any = {};

  tabs: SettingsTab[] = [
    { key: 'company',     label: 'Company',       group: 'company'     },
    { key: 'site',        label: 'Site',           group: 'site'        },
    { key: 'order_setup', label: 'Order Setup',    group: 'order_setup' },
    { key: 'notification',label: 'Notifications',  group: 'notification'},
    { key: 'mail',        label: 'Email / SMTP',   group: 'mail'        },
    { key: 'payment',     label: 'Payment',        group: 'payment'     },
    { key: 'sms',         label: 'SMS',            group: 'sms'         },
    { key: 'social_media',label: 'Social Media',   group: 'social_media'},
    { key: 'theme',       label: 'Theme',          group: 'theme'       },
  ];

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.api.get<any>('admin/settings/company').subscribe({ next: (d) => { this.companySettings = d ?? {}; this.loading = false; } });
    this.api.get<any>('admin/settings/site').subscribe({ next: (d) => this.siteSettings = d ?? {} });
    this.api.get<any>('admin/settings/order_setup').subscribe({ next: (d) => this.orderSetupSettings = d ?? {} });
    this.api.get<any>('admin/settings/notification').subscribe({ next: (d) => this.notificationSettings = d ?? {} });
    this.api.get<any>('admin/settings/mail').subscribe({ next: (d) => this.mailSettings = d ?? {} });
    this.api.get<any>('admin/settings/payment').subscribe({ next: (d) => this.paymentSettings = d ?? {} });
    this.api.get<any>('admin/settings/sms').subscribe({ next: (d) => this.smsSettings = d ?? {} });
    this.api.get<any>('admin/settings/social_media').subscribe({ next: (d) => this.socialSettings = d ?? {} });
    this.api.get<any>('admin/settings/theme').subscribe({ next: (d) => this.themeSettings = d ?? {} });
  }

  dataFor(group: string): any {
    const map: Record<string, any> = {
      company: this.companySettings,
      site: this.siteSettings,
      order_setup: this.orderSetupSettings,
      notification: this.notificationSettings,
      mail: this.mailSettings,
      payment: this.paymentSettings,
      sms: this.smsSettings,
      social_media: this.socialSettings,
      theme: this.themeSettings,
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
