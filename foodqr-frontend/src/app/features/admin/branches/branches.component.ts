import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Branch } from '../../../core/models';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
})
export class BranchesComponent implements OnInit {
  branches: Branch[] = [];
  loading = false;
  saving = false;

  showModal = false;
  editingId: string | null = null;
  form: FormGroup;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      phone: [''],
      email: ['', Validators.email],
      status: [true],
    });
  }

  ngOnInit(): void {
    this.load();
    // Auto-generate slug from name
    this.form.get('name')!.valueChanges.subscribe((val: string) => {
      if (!this.editingId) {
        this.form.get('slug')!.setValue(
          val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          { emitEvent: false },
        );
      }
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<any>('admin/branches').subscribe({
      next: (res) => {
        this.branches = Array.isArray(res) ? res : (res.data ?? []);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ status: true });
    this.showModal = true;
  }

  openEdit(branch: Branch): void {
    this.editingId = branch.id;
    this.form.patchValue({
      name: branch.name,
      slug: (branch as any).slug ?? '',
      address: branch.address ?? '',
      city: branch.city ?? '',
      state: (branch as any).state ?? '',
      country: (branch as any).country ?? '',
      phone: branch.phone ?? '',
      email: branch.email ?? '',
      status: branch.status,
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const payload = this.form.value;
    const req = this.editingId
      ? this.api.patch(`admin/branches/${this.editingId}`, payload)
      : this.api.post('admin/branches', payload);

    req.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Branch updated' : 'Branch created');
        this.showModal = false;
        this.saving = false;
        this.load();
      },
      error: () => { this.saving = false; },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this branch?')) return;
    this.api.delete(`admin/branches/${id}`).subscribe({
      next: () => { this.toastr.success('Branch deleted'); this.load(); },
    });
  }

  setDefault(id: string): void {
    this.api.patch(`admin/branches/${id}/set-default`, {}).subscribe({
      next: () => { this.toastr.success('Default branch updated'); this.load(); },
    });
  }
}
