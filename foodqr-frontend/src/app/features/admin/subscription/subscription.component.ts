import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Tenant, TenantInvoice } from '../../../core/models';

interface MyTenantResponse {
  tenant: Tenant;
  usage: { branchCount: number; staffCount: number; maxBranches: number | null; maxStaff: number | null };
}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
})
export class SubscriptionComponent implements OnInit {
  loading = false;
  data: MyTenantResponse | null = null;
  error = '';
  invoices: TenantInvoice[] = [];
  migrating = false;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.get<MyTenantResponse>('tenant-info/mine').subscribe({
      next: (res) => { this.data = res; this.loading = false; },
      error: () => { this.loading = false; this.error = 'No tenant subscription is associated with this account.'; },
    });
    this.api.get<TenantInvoice[]>('tenant-info/invoices').subscribe({ next: (res) => (this.invoices = res || []) });
  }

  runMigration(): void {
    this.migrating = true;
    this.api.post<{ lastMigrationAt: string }>('tenant-info/run-migration', {}).subscribe({
      next: (res) => {
        this.toastr.success('Schema synchronized');
        if (this.data) this.data.tenant.lastMigrationAt = res.lastMigrationAt;
        this.migrating = false;
      },
      error: () => { this.migrating = false; },
    });
  }
}
