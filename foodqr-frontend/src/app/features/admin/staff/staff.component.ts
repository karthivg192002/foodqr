import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { RolesService, RoleDef } from '../../../core/services/roles.service';
import { User } from '../../../core/models';

@Component({ selector: 'app-staff', templateUrl: './staff.component.html' })
export class StaffComponent implements OnInit {
  staff: User[] = [];
  loading = false;
  showForm = false;
  saving = false;
  form: FormGroup;
  roles: RoleDef[] = [];

  // Detail drawer
  selected: User | null = null;
  detailTab: 'profile' | 'security' | 'addresses' | 'orders' = 'profile';
  addresses: any[] = [];
  orders: any[] = [];
  detailLoading = false;
  uploadingImage = false;
  passwordForm: FormGroup;
  changingPassword = false;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private rolesService: RolesService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      role: ['waiter', Validators.required],
    });
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.load();
    this.rolesService.load();
    this.rolesService.roles$.subscribe((roles) => {
      this.roles = roles.filter((r) => r.name !== 'customer');
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<any>('admin/staff').subscribe({
      next: (res) => { this.staff = res.data || res; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.post('auth/register', this.form.value).subscribe({
      next: () => { this.toastr.success('Staff member created'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  get hasOrderHistory(): boolean {
    return this.selected?.role === 'waiter' || this.selected?.role === 'chef';
  }

  private ordersEndpoint(staff: User): string {
    return staff.role === 'waiter' ? `admin/waiters/${staff.id}/orders` : `admin/chefs/${staff.id}/orders`;
  }

  openDetail(member: User): void {
    this.selected = member;
    this.detailTab = 'profile';
    this.addresses = [];
    this.orders = [];
    this.passwordForm.reset();
  }

  closeDetail(): void {
    this.selected = null;
  }

  onDetailTabChange(tab: 'profile' | 'security' | 'addresses' | 'orders'): void {
    this.detailTab = tab;
    if (!this.selected) return;
    if (tab === 'addresses' && !this.addresses.length) {
      this.detailLoading = true;
      this.api.get<any[]>(`admin/staff/${this.selected.id}/addresses`).subscribe({
        next: (res) => { this.addresses = res || []; this.detailLoading = false; },
        error: () => { this.detailLoading = false; },
      });
    }
    if (tab === 'orders' && this.hasOrderHistory && !this.orders.length) {
      this.detailLoading = true;
      this.api.get<any>(this.ordersEndpoint(this.selected)).subscribe({
        next: (res) => { this.orders = res?.data || res || []; this.detailLoading = false; },
        error: () => { this.detailLoading = false; },
      });
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.selected) return;
    this.uploadingImage = true;
    this.api.upload('upload/image', file).subscribe({
      next: (res) => {
        this.api.patch(`admin/users/${this.selected!.id}/image`, { profileImage: res.url }).subscribe({
          next: () => {
            this.selected!.profileImage = res.url;
            this.uploadingImage = false;
            this.toastr.success('Profile image updated');
          },
          error: () => { this.uploadingImage = false; },
        });
      },
      error: () => { this.uploadingImage = false; this.toastr.error('Upload failed'); },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.selected) return;
    this.changingPassword = true;
    this.api.patch(`admin/users/${this.selected.id}/password`, this.passwordForm.value).subscribe({
      next: () => { this.toastr.success('Password updated'); this.changingPassword = false; this.passwordForm.reset(); },
      error: () => { this.changingPassword = false; },
    });
  }
}
