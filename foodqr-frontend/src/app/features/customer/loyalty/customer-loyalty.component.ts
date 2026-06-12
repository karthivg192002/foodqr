import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-customer-loyalty',
  templateUrl: './customer-loyalty.component.html',
})
export class CustomerLoyaltyComponent implements OnInit {
  dashboard: any = null;
  loading = true;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<any>('loyalty/dashboard').subscribe({
      next: (d) => { this.dashboard = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  redeem(rewardId: string): void {
    this.api.post(`loyalty/redeem/${rewardId}`, {}).subscribe({
      next: () => { this.toastr.success('Reward redeemed!'); this.load(); },
    });
  }
}
