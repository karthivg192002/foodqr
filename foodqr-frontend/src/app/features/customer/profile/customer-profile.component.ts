import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
})
export class CustomerProfileComponent implements OnInit {
  user: Partial<User> = {};
  saving = false;

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const u = this.authService.currentUser;
    if (u) this.user = { name: u.name, email: u.email, phone: u.phone };
  }

  save(): void {
    this.saving = true;
    this.api.patch<User>('profile', this.user).subscribe({
      next: () => { this.toastr.success('Profile updated'); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  logout(): void { this.authService.logout(); }
}
