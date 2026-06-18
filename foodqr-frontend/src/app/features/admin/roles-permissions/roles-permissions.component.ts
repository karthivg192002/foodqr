import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { RolesService } from '../../../core/services/roles.service';

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
})
export class RolesPermissionsComponent implements OnInit {
  staff: any[] = [];
  loading = false;
  saving: Record<string, boolean> = {};
  roles: string[] = [];
  search = '';

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private rolesService: RolesService,
  ) {}

  ngOnInit(): void {
    this.rolesService.load();
    this.rolesService.roles$.subscribe((roles) => {
      this.roles = roles.map((r) => r.name);
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<any>('admin/staff', { search: this.search || undefined, limit: 100 }).subscribe({
      next: (res) => { this.staff = res.data || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  changeRole(user: any, newRole: string): void {
    this.saving[user.id] = true;
    this.api.patch(`admin/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => {
        user.role = newRole;
        this.toastr.success(`Role updated to ${this.roleLabel(newRole)}`);
        this.saving[user.id] = false;
      },
      error: () => { this.saving[user.id] = false; },
    });
  }

  changeBranch(user: any, branchId: string): void {
    this.api.patch(`admin/users/${user.id}/default-branch`, { branchId }).subscribe({
      next: () => { this.toastr.success('Branch updated'); },
    });
  }

  roleLabel(role: string): string { return this.rolesService.getLabel(role); }
  roleClass(role: string): string { return this.rolesService.getClass(role); }
}
