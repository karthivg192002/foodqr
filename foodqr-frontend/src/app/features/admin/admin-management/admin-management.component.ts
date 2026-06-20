import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';

@Component({ selector: 'app-admin-management', templateUrl: './admin-management.component.html' })
export class AdminManagementComponent implements OnInit {
  admins: User[] = [];
  total = 0;
  page = 1;
  limit = 20;
  loading = false;
  search = '';

  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: FormGroup;

  showPasswordForm = false;
  passwordTargetId: string | null = null;
  passwordForm: FormGroup;
  changingPassword = false;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      phone: [''],
      status: ['active'],
    });
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<any>('admin/administrators', { page: this.page, limit: this.limit, search: this.search }).subscribe({
      next: (res) => {
        this.admins = res?.data || [];
        this.total = res?.total || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ status: 'active' });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  openEdit(admin: User): void {
    this.editingId = admin.id;
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.patchValue({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      status: admin.status,
    });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { password, ...rest } = this.form.value;

    if (this.editingId) {
      this.api.patch(`admin/users/${this.editingId}`, rest).subscribe({
        next: () => { this.toastr.success('Administrator updated'); this.showForm = false; this.load(); this.saving = false; },
        error: () => { this.saving = false; },
      });
    } else {
      this.api.post('admin/users', { ...rest, password, role: 'admin' }).subscribe({
        next: () => { this.toastr.success('Administrator created'); this.showForm = false; this.load(); this.saving = false; },
        error: () => { this.saving = false; },
      });
    }
  }

  toggleStatus(admin: User): void {
    const status = admin.status === 'active' ? 'inactive' : 'active';
    this.api.patch(`admin/users/${admin.id}`, { status }).subscribe({
      next: () => { this.toastr.success(status === 'active' ? 'Administrator activated' : 'Administrator deactivated'); this.load(); },
    });
  }

  openPasswordForm(admin: User): void {
    this.passwordTargetId = admin.id;
    this.passwordForm.reset();
    this.showPasswordForm = true;
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.passwordTargetId) return;
    this.changingPassword = true;
    this.api.patch(`admin/users/${this.passwordTargetId}/password`, this.passwordForm.value).subscribe({
      next: () => { this.toastr.success('Password updated'); this.showPasswordForm = false; this.changingPassword = false; },
      error: () => { this.changingPassword = false; },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this administrator?')) return;
    this.api.delete(`admin/users/${id}`).subscribe({
      next: () => { this.toastr.success('Administrator deleted'); this.load(); },
    });
  }

  get pages(): number { return Math.ceil(this.total / this.limit); }
}
