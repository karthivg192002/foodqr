import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { LoyaltyProgram } from '../../../core/models';

@Component({ selector: 'app-loyalty', templateUrl: './loyalty.component.html' })
export class LoyaltyComponent implements OnInit {
  activeTab: 'programs' | 'settings' | 'segments' | 'configs' = 'programs';

  programs: LoyaltyProgram[] = [];
  loading = false;
  showForm = false;
  saving = false;
  form: FormGroup;

  // Config form
  showConfigForm = false;
  configProgramId = '';
  configForm: FormGroup;
  configSaving = false;
  calculationTypes = ['fixed_per_order', 'order_amount', 'percentage_based'];

  // Loyalty settings
  loyaltySettings: any = {};
  settingsSaving = false;

  // Segments
  segments: any = null;
  segmentsLoading = false;
  leaderboard: any[] = [];

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    public currencyService: CurrencyService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      requiredStamps: [10, [Validators.required, Validators.min(1)]],
      isActive: [true],
      autoResetStamps: [true],
    });
    this.configForm = this.fb.group({
      calculationType: ['fixed_per_order', Validators.required],
      thresholdValue: [0],
      stampsPerThreshold: [1, [Validators.required, Validators.min(1)]],
      maxStampsPerPeriod: [null],
      periodType: ['lifetime'],
    });
  }

  ngOnInit(): void { this.load(); this.loadSettings(); }

  load(): void {
    this.loading = true;
    this.api.get<LoyaltyProgram[]>('admin/loyalty/programs').subscribe({
      next: (data) => { this.programs = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  loadSettings(): void {
    this.api.get<any>('admin/loyalty-settings').subscribe({
      next: (d) => { this.loyaltySettings = d || {}; },
    });
  }

  loadSegments(): void {
    this.segmentsLoading = true;
    this.api.get<any>('admin/loyalty/segments').subscribe({
      next: (d) => { this.segments = d; this.segmentsLoading = false; },
      error: () => { this.segmentsLoading = false; },
    });
    this.api.get<any[]>('admin/loyalty/leaderboard').subscribe({
      next: (d) => { this.leaderboard = d || []; },
    });
  }

  onTabChange(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    if (tab === 'segments' && !this.segments) this.loadSegments();
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.post('admin/loyalty/programs', this.form.value).subscribe({
      next: () => { this.toastr.success('Program created'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  openConfigForm(programId: string): void {
    this.configProgramId = programId;
    this.configForm.reset({ calculationType: 'fixed_per_order', stampsPerThreshold: 1, periodType: 'lifetime' });
    this.showConfigForm = true;
  }

  saveConfig(): void {
    if (this.configForm.invalid) return;
    this.configSaving = true;
    this.api.post(`admin/loyalty/programs/${this.configProgramId}/configurations`, this.configForm.value).subscribe({
      next: () => { this.toastr.success('Configuration added'); this.showConfigForm = false; this.load(); this.configSaving = false; },
      error: () => { this.configSaving = false; },
    });
  }

  saveSettings(): void {
    this.settingsSaving = true;
    this.api.post('admin/loyalty-settings/bulk', { settings: this.loyaltySettings }).subscribe({
      next: () => { this.toastr.success('Loyalty settings saved'); this.settingsSaving = false; },
      error: () => { this.settingsSaving = false; },
    });
  }

  toggleActive(p: LoyaltyProgram): void {
    this.api.patch(`admin/loyalty/programs/${p.id}`, { isActive: !p.isActive }).subscribe({
      next: () => { this.toastr.success('Updated'); this.load(); },
    });
  }

  getSegmentColor(tier: string): string {
    return { new: 'badge-gray', bronze: 'badge-warning', silver: 'text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 text-xs', gold: 'badge-success' }[tier] || 'badge-gray';
  }
}
