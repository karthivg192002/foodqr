import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

  features = [
    'QR-based table ordering system',
    'Real-time kitchen display (KDS)',
    'Multi-branch management',
    'Loyalty rewards program',
    'Integrated POS terminal',
    'Advanced reports & analytics',
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private toastr: ToastrService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.toastr.success('Welcome back!');
        this.router.navigate([this.authService.getRedirectPath()]);
      },
      error: () => { this.loading = false; },
    });
  }
}
