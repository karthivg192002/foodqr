import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

const ROLES = ['admin', 'branch_manager', 'waiter', 'chef', 'staff', 'pos_operator', 'customer'];
const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  branch_manager: 'Branch Manager',
  waiter: 'Waiter',
  chef: 'Chef',
  staff: 'Staff',
  pos_operator: 'POS Operator',
  customer: 'Customer',
};
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  branch_manager: 'bg-blue-100 text-blue-800',
  waiter: 'bg-green-100 text-green-800',
  chef: 'bg-yellow-100 text-yellow-800',
  staff: 'bg-gray-100 text-gray-700',
  pos_operator: 'bg-indigo-100 text-indigo-800',
  customer: 'bg-orange-100 text-orange-800',
};

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
})
export class RolesPermissionsComponent implements OnInit {
  staff: any[] = [];
  loading = false;
  saving: Record<string, boolean> = {};
  roles = ROLES;
  roleLabels = ROLE_LABELS;
  roleColors = ROLE_COLORS;
  search = '';

  constructor(private api: ApiService, private toastr: ToastrService) {}

  roleDescriptions: Record<string, string> = {};

  ngOnInit(): void {
    // Load role definitions from backend
    this.api.get<any>('admin/roles').subscribe({
      next: (res) => {
        (res.roles || []).forEach((r: any) => { this.roleDescriptions[r.value] = r.description; });
      },
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
        this.toastr.success(`Role updated to ${ROLE_LABELS[newRole]}`);
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

  roleLabel(role: string): string { return ROLE_LABELS[role] || role; }
  roleClass(role: string): string { return ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'; }
}
