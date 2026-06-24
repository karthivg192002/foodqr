import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-currency-tax',
  templateUrl: './currency-tax.component.html',
})
export class CurrencyTaxComponent implements OnInit {
  activeTab: 'currencies' | 'taxes' | 'service-charges' = 'currencies';

  currencies: any[] = [];
  taxes: any[] = [];
  serviceCharges: any[] = [];
  loading = false;
  saving = false;

  // Currency modal
  showCurrencyModal = false;
  editingCurrencyId: string | null = null;
  currencyForm: FormGroup;

  // Tax modal
  showTaxModal = false;
  editingTaxId: string | null = null;
  taxForm: FormGroup;

  // Service charge modal
  showServiceChargeModal = false;
  editingServiceChargeId: string | null = null;
  serviceChargeForm: FormGroup;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {
    this.currencyForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(10)]],
      symbol: ['', Validators.required],
      exchangeRate: [1, [Validators.required, Validators.min(0)]],
      isDefault: [false],
      status: [true],
    });

    this.taxForm = this.fb.group({
      name: ['', Validators.required],
      rate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      type: ['percentage'],
      isDefault: [false],
      status: [true],
    });

    this.serviceChargeForm = this.fb.group({
      name: ['', Validators.required],
      rate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      type: ['percentage'],
      isDefault: [false],
      status: [true],
    });
  }

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadTaxes();
    this.loadServiceCharges();
  }

  loadCurrencies(): void {
    this.loading = true;
    this.api.get<any>('admin/currencies').subscribe({
      next: (res) => { this.currencies = Array.isArray(res) ? res : (res.data ?? []); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  loadTaxes(): void {
    this.api.get<any>('admin/taxes').subscribe({
      next: (res) => { this.taxes = Array.isArray(res) ? res : (res.data ?? []); },
    });
  }

  loadServiceCharges(): void {
    this.api.get<any>('admin/service-charges').subscribe({
      next: (res) => { this.serviceCharges = Array.isArray(res) ? res : (res.data ?? []); },
    });
  }

  // ── Currency CRUD ──
  openCreateCurrency(): void {
    this.editingCurrencyId = null;
    this.currencyForm.reset({ exchangeRate: 1, isDefault: false, status: true });
    this.showCurrencyModal = true;
  }

  openEditCurrency(c: any): void {
    this.editingCurrencyId = c.id;
    this.currencyForm.patchValue(c);
    this.showCurrencyModal = true;
  }

  saveCurrency(): void {
    if (this.currencyForm.invalid) { this.currencyForm.markAllAsTouched(); return; }
    this.saving = true;
    const req = this.editingCurrencyId
      ? this.api.patch(`admin/currencies/${this.editingCurrencyId}`, this.currencyForm.value)
      : this.api.post('admin/currencies', this.currencyForm.value);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingCurrencyId ? 'Currency updated' : 'Currency created');
        this.showCurrencyModal = false;
        this.saving = false;
        this.loadCurrencies();
      },
      error: () => { this.saving = false; },
    });
  }

  deleteCurrency(id: string): void {
    if (!confirm('Delete this currency?')) return;
    this.api.delete(`admin/currencies/${id}`).subscribe({
      next: () => { this.toastr.success('Currency deleted'); this.loadCurrencies(); },
    });
  }

  setDefaultCurrency(id: string): void {
    this.api.patch(`admin/currencies/${id}/set-default`, {}).subscribe({
      next: () => { this.toastr.success('Default currency updated'); this.loadCurrencies(); },
    });
  }

  // ── Tax CRUD ──
  openCreateTax(): void {
    this.editingTaxId = null;
    this.taxForm.reset({ rate: 0, type: 'percentage', isDefault: false, status: true });
    this.showTaxModal = true;
  }

  openEditTax(t: any): void {
    this.editingTaxId = t.id;
    this.taxForm.patchValue(t);
    this.showTaxModal = true;
  }

  saveTax(): void {
    if (this.taxForm.invalid) { this.taxForm.markAllAsTouched(); return; }
    this.saving = true;
    const req = this.editingTaxId
      ? this.api.patch(`admin/taxes/${this.editingTaxId}`, this.taxForm.value)
      : this.api.post('admin/taxes', this.taxForm.value);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingTaxId ? 'Tax updated' : 'Tax created');
        this.showTaxModal = false;
        this.saving = false;
        this.loadTaxes();
      },
      error: () => { this.saving = false; },
    });
  }

  deleteTax(id: string): void {
    if (!confirm('Delete this tax?')) return;
    this.api.delete(`admin/taxes/${id}`).subscribe({
      next: () => { this.toastr.success('Tax deleted'); this.loadTaxes(); },
    });
  }

  setDefaultTax(id: string): void {
    this.api.patch(`admin/taxes/${id}/set-default`, {}).subscribe({
      next: () => { this.toastr.success('Default tax updated'); this.loadTaxes(); },
    });
  }

  // ── Service Charge CRUD ──
  openCreateServiceCharge(): void {
    this.editingServiceChargeId = null;
    this.serviceChargeForm.reset({ rate: 0, type: 'percentage', isDefault: false, status: true });
    this.showServiceChargeModal = true;
  }

  openEditServiceCharge(c: any): void {
    this.editingServiceChargeId = c.id;
    this.serviceChargeForm.patchValue(c);
    this.showServiceChargeModal = true;
  }

  saveServiceCharge(): void {
    if (this.serviceChargeForm.invalid) { this.serviceChargeForm.markAllAsTouched(); return; }
    this.saving = true;
    const req = this.editingServiceChargeId
      ? this.api.patch(`admin/service-charges/${this.editingServiceChargeId}`, this.serviceChargeForm.value)
      : this.api.post('admin/service-charges', this.serviceChargeForm.value);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingServiceChargeId ? 'Service charge updated' : 'Service charge created');
        this.showServiceChargeModal = false;
        this.saving = false;
        this.loadServiceCharges();
      },
      error: () => { this.saving = false; },
    });
  }

  deleteServiceCharge(id: string): void {
    if (!confirm('Delete this service charge?')) return;
    this.api.delete(`admin/service-charges/${id}`).subscribe({
      next: () => { this.toastr.success('Service charge deleted'); this.loadServiceCharges(); },
    });
  }

  setDefaultServiceCharge(id: string): void {
    this.api.patch(`admin/service-charges/${id}/set-default`, {}).subscribe({
      next: () => { this.toastr.success('Default service charge updated'); this.loadServiceCharges(); },
    });
  }
}
