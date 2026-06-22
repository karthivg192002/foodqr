import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { SaasPlan } from '../../../core/models';

@Component({
  selector: 'app-superadmin-plans',
  templateUrl: './superadmin-plans.component.html',
})
export class SuperadminPlansComponent implements OnInit {
  plans: SaasPlan[] = [];
  loading = false;
  saving = false;

  showModal = false;
  editingId: string | null = null;
  form: FormGroup;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      monthlyPrice: [0, Validators.required],
      yearlyPrice: [null],
      maxBranches: [1, Validators.required],
      maxStaff: [5, Validators.required],
      maxMenuItems: [-1],
      maxOrdersPerMonth: [-1],
      isActive: [true],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<SaasPlan[]>('super-admin/plans').subscribe({
      next: (res) => { this.plans = res || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ monthlyPrice: 0, maxBranches: 1, maxStaff: 5, maxMenuItems: -1, maxOrdersPerMonth: -1, isActive: true });
    this.showModal = true;
  }

  openEdit(p: SaasPlan): void {
    this.editingId = p.id;
    this.form.patchValue(p);
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const payload = this.form.value;
    const req = this.editingId
      ? this.api.patch(`super-admin/plans/${this.editingId}`, payload)
      : this.api.post('super-admin/plans', payload);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Plan updated' : 'Plan created');
        this.showModal = false; this.saving = false; this.load();
      },
      error: () => { this.saving = false; },
    });
  }

  remove(p: SaasPlan): void {
    if (!confirm(`Delete plan "${p.name}"?`)) return;
    this.api.delete(`super-admin/plans/${p.id}`).subscribe({
      next: () => { this.toastr.success('Plan deleted'); this.load(); },
      error: () => { this.toastr.error('Plan is in use by tenants'); },
    });
  }
}
