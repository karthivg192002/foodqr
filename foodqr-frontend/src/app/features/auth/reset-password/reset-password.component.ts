import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  done = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.toastr.error('Invalid or missing reset token');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  submit(): void {
    if (!this.password || this.password.length < 6) { this.toastr.warning('Password must be at least 6 characters'); return; }
    if (this.password !== this.confirmPassword) { this.toastr.warning('Passwords do not match'); return; }
    this.loading = true;
    this.api.post('auth/reset-password', { token: this.token, newPassword: this.password }).subscribe({
      next: () => { this.done = true; this.loading = false; this.toastr.success('Password reset successfully!'); },
      error: () => { this.loading = false; },
    });
  }
}
