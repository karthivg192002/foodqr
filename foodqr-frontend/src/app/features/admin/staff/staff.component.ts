import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { RolesService, RoleDef } from '../../../core/services/roles.service';
import { User } from '../../../core/models';

@Component({ selector: 'app-staff', templateUrl: './staff.component.html' })
export class StaffComponent implements OnInit {
  staff: User[] = [];
  loading = false;
  showForm = false;
  saving = false;
  form: FormGroup;
  roles: RoleDef[] = [];

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private rolesService: RolesService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      role: ['waiter', Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();
    this.rolesService.load();
    this.rolesService.roles$.subscribe((roles) => {
      this.roles = roles.filter((r) => r.name !== 'customer');
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<any>('admin/staff').subscribe({
      next: (res) => { this.staff = res.data || res; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.post('auth/register', this.form.value).subscribe({
      next: () => { this.toastr.success('Staff member created'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }
}
