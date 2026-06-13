import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  step: 1 | 2 | 3 = 1;
  loading = false;

  // Step 1
  email = '';
  // Step 2
  otp = '';
  // Step 3
  name = '';
  password = '';
  phone = '';

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  sendOtp(): void {
    if (!this.email) { this.toastr.warning('Please enter your email'); return; }
    this.loading = true;
    this.api.post('auth/otp/send', { email: this.email }).subscribe({
      next: () => { this.toastr.success('OTP sent to your email'); this.step = 2; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  verifyOtp(): void {
    if (!this.otp) { this.toastr.warning('Please enter the OTP'); return; }
    this.loading = true;
    this.api.post('auth/otp/verify', { email: this.email, otp: this.otp }).subscribe({
      next: () => { this.step = 3; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  completeRegistration(): void {
    if (!this.name || !this.password) { this.toastr.warning('Name and password are required'); return; }
    if (this.password.length < 6) { this.toastr.warning('Password must be at least 6 characters'); return; }
    this.loading = true;
    this.authService.register({ name: this.name, email: this.email, password: this.password, phone: this.phone }).subscribe({
      next: () => { this.toastr.success('Account created successfully!'); this.router.navigate(['/customer/home']); },
      error: () => { this.loading = false; },
    });
  }

  resendOtp(): void {
    this.loading = true;
    this.api.post('auth/otp/send', { email: this.email }).subscribe({
      next: () => { this.toastr.success('OTP resent'); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
