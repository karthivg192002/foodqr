import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { TenantInvoice } from '../../../core/models';

@Component({
  selector: 'app-superadmin-billing',
  templateUrl: './superadmin-billing.component.html',
})
export class SuperadminBillingComponent implements OnInit {
  invoices: TenantInvoice[] = [];
  loading = false;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<TenantInvoice[]>('super-admin/invoices').subscribe({
      next: (res) => { this.invoices = res || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  markPaid(invoice: TenantInvoice): void {
    this.api.post(`super-admin/invoices/${invoice.id}/mark-paid`, {}).subscribe({
      next: () => { this.toastr.success('Invoice marked paid'); this.load(); },
    });
  }
}
