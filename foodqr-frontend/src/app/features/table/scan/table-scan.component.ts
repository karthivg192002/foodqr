import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { DiningTable } from '../../../core/models';

@Component({
  selector: 'app-table-scan',
  templateUrl: './table-scan.component.html',
})
export class TableScanComponent implements OnInit {
  table: DiningTable | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.get<DiningTable>(`frontend/dining-tables/slug/${slug}`).subscribe({
      next: (t) => {
        this.table = t;
        this.cartService.tableId = t.id;
        this.cartService.branchId = t.branchId;
        this.loading = false;
      },
      error: () => {
        this.error = 'Table not found. Please scan a valid QR code.';
        this.loading = false;
      },
    });
  }

  proceed(): void {
    if (this.table) {
      this.router.navigate(['/table', this.table.slug, 'menu']);
    }
  }
}
