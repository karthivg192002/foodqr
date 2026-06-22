import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Tenant, SaasPlan } from '../../../core/models';

@Component({
  selector: 'app-superadmin-tenants',
  templateUrl: './superadmin-tenants.component.html',
})
export class SuperadminTenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  plans: SaasPlan[] = [];
  loading = false;
  saving = false;
  statusFilter = '';

  showModal = false;
  form: FormGroup;

  showAssignModal = false;
  assignTenant: Tenant | null = null;
  assignPlanId = '';
  assignMonths = 1;

  createdCredentials: { email: string; tempPassword: string } | null = null;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: [''],
      planId: [''],
      adminName: [''],
      adminEmail: ['', Validators.email],
      adminPassword: [''],
    });
  }

  ngOnInit(): void {
    this.load();
    this.api.get<SaasPlan[]>('super-admin/plans').subscribe({ next: (p) => (this.plans = p || []) });
  }

  load(): void {
    this.loading = true;
    this.api.get<Tenant[]>('super-admin/tenants', this.statusFilter ? { status: this.statusFilter } : undefined).subscribe({
      next: (res) => { this.tenants = res || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.createdCredentials = null;
    this.form.reset();
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.api.post<any>('super-admin/tenants', this.form.value).subscribe({
      next: (res) => {
        this.toastr.success('Tenant created');
        this.createdCredentials = res.adminCredentials || null;
        this.saving = false;
        this.load();
        if (!this.createdCredentials) this.showModal = false;
      },
      error: () => { this.saving = false; },
    });
  }

  suspend(t: Tenant): void {
    if (!confirm(`Suspend ${t.name}?`)) return;
    this.api.post(`super-admin/tenants/${t.id}/suspend`, {}).subscribe({
      next: () => { this.toastr.success('Tenant suspended'); this.load(); },
    });
  }

  activate(t: Tenant): void {
    this.api.post(`super-admin/tenants/${t.id}/activate`, {}).subscribe({
      next: () => { this.toastr.success('Tenant activated'); this.load(); },
    });
  }

  retryProvisioning(t: Tenant): void {
    this.api.post<any>(`super-admin/tenants/${t.id}/retry-provisioning`, {}).subscribe({
      next: (res) => {
        this.toastr.success('Provisioning retried');
        this.createdCredentials = res.adminCredentials || null;
        if (this.createdCredentials) this.showModal = true;
        this.load();
      },
      error: () => this.toastr.error('Provisioning failed again — check server logs'),
    });
  }

  runMigration(t: Tenant): void {
    this.api.post(`super-admin/tenants/${t.id}/run-migration`, {}).subscribe({
      next: () => { this.toastr.success('Schema synchronized'); this.load(); },
    });
  }

  runMigrationForAll(): void {
    if (!confirm('Re-sync the schema for every provisioned tenant?')) return;
    this.api.post('super-admin/tenants/run-migration-all', {}).subscribe({
      next: () => { this.toastr.success('Migration run started for all tenants'); this.load(); },
    });
  }

  generateInvoice(t: Tenant): void {
    if (!t.planId) { this.toastr.error('Assign a plan before invoicing'); return; }
    this.api.post(`super-admin/tenants/${t.id}/invoices`, { months: 1 }).subscribe({
      next: () => this.toastr.success('Invoice generated'),
    });
  }

  openAssign(t: Tenant): void {
    this.assignTenant = t;
    this.assignPlanId = t.planId || '';
    this.assignMonths = 1;
    this.showAssignModal = true;
  }

  assignPlan(): void {
    if (!this.assignTenant || !this.assignPlanId) return;
    this.api.post(`super-admin/tenants/${this.assignTenant.id}/assign-plan`, {
      planId: this.assignPlanId, subscriptionMonths: this.assignMonths,
    }).subscribe({
      next: () => { this.toastr.success('Plan assigned'); this.showAssignModal = false; this.load(); },
    });
  }
}
