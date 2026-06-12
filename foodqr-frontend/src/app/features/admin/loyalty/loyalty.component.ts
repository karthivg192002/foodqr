import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { LoyaltyProgram } from '../../../core/models';

@Component({ selector: 'app-loyalty', templateUrl: './loyalty.component.html' })
export class LoyaltyComponent implements OnInit {
  programs: LoyaltyProgram[] = [];
  loading = false;
  showForm = false;
  saving = false;
  form: FormGroup;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      requiredStamps: [10, [Validators.required, Validators.min(1)]],
      isActive: [true],
      autoResetStamps: [true],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<LoyaltyProgram[]>('admin/loyalty/programs').subscribe({
      next: (data) => { this.programs = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.post('admin/loyalty/programs', this.form.value).subscribe({
      next: () => { this.toastr.success('Program created'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  toggleActive(p: LoyaltyProgram): void {
    this.api.patch(`admin/loyalty/programs/${p.id}`, { isActive: !p.isActive }).subscribe({
      next: () => { this.toastr.success('Updated'); this.load(); },
    });
  }
}
