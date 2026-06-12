import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User, PaginatedResponse } from '../../../core/models';

@Component({ selector: 'app-customers', templateUrl: './customers.component.html' })
export class CustomersComponent implements OnInit {
  customers: User[] = [];
  total = 0;
  page = 1;
  loading = false;
  search = '';

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<PaginatedResponse<User>>('admin/customers', { page: this.page, limit: 20, search: this.search }).subscribe({
      next: (res) => { this.customers = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get pages(): number { return Math.ceil(this.total / 20); }
}
