import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { SuperAdminDashboard } from '../../../core/models';

@Component({
  selector: 'app-superadmin-dashboard',
  templateUrl: './superadmin-dashboard.component.html',
})
export class SuperadminDashboardComponent implements OnInit {
  loading = false;
  data: SuperAdminDashboard | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.get<SuperAdminDashboard>('super-admin/dashboard').subscribe({
      next: (res) => { this.data = res; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
