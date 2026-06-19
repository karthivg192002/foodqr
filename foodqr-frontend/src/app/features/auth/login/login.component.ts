import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

interface RoleTab {
  key: string;
  label: string;
  icon: string;
  heading: string;
  subtitle: string;
  emailPlaceholder: string;
  features: string[];
}

@Component({ selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  selectedRoleTab = 'customer';

  roleTabs: RoleTab[] = [
    {
      key: 'customer',
      label: 'Customer',
      icon: 'user',
      heading: 'Order your favorite meals',
      subtitle: 'Browse the menu, order online, and track your delivery in real time.',
      emailPlaceholder: 'you@email.com',
      features: ['QR-based table ordering', 'Live order tracking', 'Loyalty rewards & redeemable stamps', 'Saved addresses & fast checkout'],
    },
    {
      key: 'staff',
      label: 'Staff',
      icon: 'user-check',
      heading: 'Run the floor, smoothly',
      subtitle: 'Manage tables, take orders, and keep service moving.',
      emailPlaceholder: 'staff@restaurant.com',
      features: ['Table & order management', 'Live order status updates', 'Point of sale access', 'Shift order history'],
    },
    {
      key: 'chef',
      label: 'Chef',
      icon: 'kitchen',
      heading: 'Kitchen, organized',
      subtitle: 'See incoming tickets the moment they fire and keep the line moving.',
      emailPlaceholder: 'chef@restaurant.com',
      features: ['Real-time kitchen display (KDS)', 'Order priority queue', 'One-tap status updates', 'Prep time tracking'],
    },
    {
      key: 'admin',
      label: 'Admin',
      icon: 'key',
      heading: 'The smarter way to run your restaurant',
      subtitle: 'QR ordering, kitchen display, loyalty programs, and multi-branch management — all in one platform.',
      emailPlaceholder: 'you@company.com',
      features: ['Multi-branch management', 'Advanced reports & analytics', 'Integrated POS terminal', 'Loyalty & promotions control'],
    },
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private toastr: ToastrService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get activeTab(): RoleTab {
    return this.roleTabs.find((t) => t.key === this.selectedRoleTab) ?? this.roleTabs[0];
  }

  selectRoleTab(key: string): void {
    this.selectedRoleTab = key;
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
