import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { RolesService, RoleDef } from '../../../core/services/roles.service';
import { ThemeService } from '../../../core/services/theme.service';

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
  uploadingLogo = false;
  uploadingFavicon = false;

  // Menu permissions
  navItems: any[] = [];
  navLoading = false;
  navSaving = false;
  showNavForm = false;
  editingNavId: string | null = null;
  navForm: any = { group: '', groupOrder: 0, name: '', iconKey: '', route: '', external: false, roles: [], sortOrder: 0 };
  allRoles: RoleDef[] = [];
  readonly ICON_KEYS = ['home','orders','kitchen','tv','pos','tag','menu','plus-circle','users','user-check','chat','table','building','clock','star','gift','chart','credit-card','currency','settings','card'];

  tabs: SettingsTab[] = [
    { key: 'company',          label: 'Company',          group: 'company'     },
    { key: 'site',             label: 'Site',             group: 'site'        },
    { key: 'order_setup',      label: 'Order Setup',      group: 'order_setup' },
    { key: 'notification',     label: 'Notifications',    group: 'notification'},
    { key: 'mail',             label: 'Email / SMTP',     group: 'mail'        },
    { key: 'payment',          label: 'Payment',          group: 'payment'     },
    { key: 'sms',              label: 'SMS',              group: 'sms'         },
    { key: 'social_media',     label: 'Social Media',     group: 'social_media'},
    { key: 'theme',            label: 'Theme',            group: 'theme'       },
    { key: 'language',         label: 'Language',         group: 'language'    },
    { key: 'license',          label: 'License',          group: 'license'     },
    { key: 'menu_permissions', label: 'Menu & Permissions', group: 'menu_permissions' },
  ];

  // Language management
  languages: any[] = [];
  languagesLoading = false;
  showLanguageForm = false;
  editingLanguageId: string | null = null;
  languageForm: any = { name: '', code: '', nativeName: '', direction: 'ltr', isDefault: false, isActive: true };

  // License management
  licenseInfo: any = null;
  licenseLoading = false;
  activatingLicense = false;
  licenseActivateForm: any = { licenseKey: '', email: '' };

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private rolesService: RolesService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.rolesService.load();
    this.rolesService.roles$.subscribe((roles) => {
      this.allRoles = roles.filter((r) => r.name !== 'customer');
    });
  }

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

  onTabChange(key: string): void {
    this.activeTab = key;
    if (key === 'menu_permissions' && !this.navItems.length) {
      this.loadNavItems();
    }
    if (key === 'language' && !this.languages.length) {
      this.loadLanguages();
    }
    if (key === 'license' && !this.licenseInfo) {
      this.loadLicenseInfo();
    }
  }

  loadLanguages(): void {
    this.languagesLoading = true;
    this.api.get<any[]>('admin/languages').subscribe({
      next: (items) => { this.languages = items ?? []; this.languagesLoading = false; },
      error: () => { this.languagesLoading = false; },
    });
  }

  openLanguageCreate(): void {
    this.editingLanguageId = null;
    this.languageForm = { name: '', code: '', nativeName: '', direction: 'ltr', isDefault: false, isActive: true };
    this.showLanguageForm = true;
  }

  openLanguageEdit(lang: any): void {
    this.editingLanguageId = lang.id;
    this.languageForm = { ...lang };
    this.showLanguageForm = true;
  }

  saveLanguage(): void {
    if (!this.languageForm.name || !this.languageForm.code) return;
    const req = this.editingLanguageId
      ? this.api.patch(`admin/languages/${this.editingLanguageId}`, this.languageForm)
      : this.api.post('admin/languages', this.languageForm);
    req.subscribe({
      next: () => { this.toastr.success('Saved'); this.showLanguageForm = false; this.loadLanguages(); },
    });
  }

  deleteLanguage(id: string): void {
    if (!confirm('Delete this language?')) return;
    this.api.delete(`admin/languages/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.loadLanguages(); },
    });
  }

  toggleLanguageActive(lang: any): void {
    this.api.patch(`admin/languages/${lang.id}`, { isActive: !lang.isActive }).subscribe({
      next: () => { lang.isActive = !lang.isActive; this.toastr.success('Updated'); },
    });
  }

  loadLicenseInfo(): void {
    this.licenseLoading = true;
    this.api.get<any>('admin/license').subscribe({
      next: (info) => { this.licenseInfo = info; this.licenseLoading = false; },
      error: () => { this.licenseLoading = false; },
    });
  }

  checkLicense(): void {
    this.licenseLoading = true;
    this.api.get<any>('admin/license/check').subscribe({
      next: (info) => { this.licenseInfo = info; this.licenseLoading = false; this.toastr.success('License checked'); },
      error: () => { this.licenseLoading = false; },
    });
  }

  activateLicense(): void {
    if (!this.licenseActivateForm.licenseKey || !this.licenseActivateForm.email) return;
    this.activatingLicense = true;
    this.api.post('admin/license/activate', this.licenseActivateForm).subscribe({
      next: () => { this.toastr.success('License activated'); this.activatingLicense = false; this.loadLicenseInfo(); },
      error: () => { this.activatingLicense = false; },
    });
  }

  deactivateLicense(): void {
    if (!confirm('Deactivate the current license?')) return;
    this.api.post('admin/license/deactivate', {}).subscribe({
      next: () => { this.toastr.success('License deactivated'); this.loadLicenseInfo(); },
    });
  }

  loadNavItems(): void {
    this.navLoading = true;
    this.api.get<any[]>('admin/nav-menus').subscribe({
      next: (items) => { this.navItems = items ?? []; this.navLoading = false; },
      error: () => { this.navLoading = false; },
    });
  }

  seedNav(force = false): void {
    this.api.post(`admin/nav-menus/seed${force ? '?force=true' : ''}`, {}).subscribe({
      next: (res: any) => { this.toastr.success(res.message); this.loadNavItems(); },
    });
  }

  hasRole(item: any, role: string): boolean {
    return !item.roles?.length || item.roles.includes(role);
  }

  toggleRole(item: any, role: string): void {
    if (!item.roles) item.roles = [];
    if (item.roles.includes(role)) {
      item.roles = item.roles.filter((r: string) => r !== role);
    } else {
      item.roles = [...item.roles, role];
    }
    this.api.patch(`admin/nav-menus/${item.id}`, { roles: item.roles }).subscribe({
      next: () => this.toastr.success(`Permissions updated for "${item.name}"`),
    });
  }

  openNavCreate(): void {
    this.editingNavId = null;
    this.navForm = { group: '', groupOrder: 0, name: '', iconKey: 'home', route: '', external: false, roles: [], sortOrder: 0 };
    this.showNavForm = true;
  }

  openNavEdit(item: any): void {
    this.editingNavId = item.id;
    this.navForm = { ...item, roles: item.roles ? [...item.roles] : [] };
    this.showNavForm = true;
  }

  saveNav(): void {
    if (!this.navForm.name || !this.navForm.group || !this.navForm.route) return;
    this.navSaving = true;
    const req = this.editingNavId
      ? this.api.patch(`admin/nav-menus/${this.editingNavId}`, this.navForm)
      : this.api.post('admin/nav-menus', this.navForm);
    req.subscribe({
      next: () => { this.toastr.success('Saved'); this.showNavForm = false; this.loadNavItems(); this.navSaving = false; },
      error: () => { this.navSaving = false; },
    });
  }

  deleteNav(id: string): void {
    if (!confirm('Delete this menu item?')) return;
    this.api.delete(`admin/nav-menus/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.loadNavItems(); },
    });
  }

  toggleNavActive(item: any): void {
    this.api.patch(`admin/nav-menus/${item.id}`, { isActive: !item.isActive }).subscribe({
      next: () => { item.isActive = !item.isActive; this.toastr.success('Updated'); },
    });
  }

  toggleNavFormRole(role: string): void {
    if (this.navForm.roles.includes(role)) {
      this.navForm.roles = this.navForm.roles.filter((r: string) => r !== role);
    } else {
      this.navForm.roles = [...this.navForm.roles, role];
    }
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
      next: () => {
        this.toastr.success('Settings saved');
        this.saving = false;
        if (group === 'theme') this.themeService.apply(this.themeSettings);
      },
      error: () => { this.saving = false; },
    });
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingLogo = true;
    this.api.upload('admin/settings/upload-logo', file).subscribe({
      next: (res) => {
        this.themeSettings['logo'] = res.url;
        this.uploadingLogo = false;
        this.toastr.success('Logo uploaded');
        this.themeService.apply(this.themeSettings);
      },
      error: () => { this.uploadingLogo = false; },
    });
  }

  onFaviconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingFavicon = true;
    this.api.upload('admin/settings/upload-favicon', file).subscribe({
      next: (res) => {
        this.themeSettings['favicon'] = res.url;
        this.uploadingFavicon = false;
        this.toastr.success('Favicon uploaded');
        this.themeService.apply(this.themeSettings);
      },
      error: () => { this.uploadingFavicon = false; },
    });
  }

  get navGroups(): string[] {
    return [...new Set(this.navItems.map((i) => i.group))];
  }

  navItemsByGroup(group: string): any[] {
    return this.navItems.filter((i) => i.group === group).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
