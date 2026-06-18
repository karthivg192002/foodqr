import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { RolesService, RoleDef, ROLE_COLOR_MAP } from '../../../core/services/roles.service';

const COLORS = ['purple', 'blue', 'green', 'yellow', 'gray', 'indigo', 'orange', 'red', 'teal', 'pink'];

@Component({
  selector: 'app-role-manager',
  templateUrl: './role-manager.component.html',
})
export class RoleManagerComponent implements OnInit {
  roles: RoleDef[] = [];
  loading = false;
  showForm = false;
  saving = false;
  editingId: string | null = null;
  colors = COLORS;
  form: Partial<RoleDef> = this.blankForm();

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private rolesService: RolesService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<RoleDef[]>('admin/role-definitions').subscribe({
      next: (roles) => { this.roles = roles; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  blankForm(): Partial<RoleDef> {
    return { name: '', label: '', description: '', color: 'gray', isActive: true };
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.blankForm();
    this.showForm = true;
  }

  openEdit(role: RoleDef): void {
    this.editingId = role.id;
    this.form = { ...role };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.name || !this.form.label) {
      this.toastr.warning('Name and label are required');
      return;
    }
    this.saving = true;
    const req = this.editingId
      ? this.api.patch(`admin/role-definitions/${this.editingId}`, this.form)
      : this.api.post('admin/role-definitions', this.form);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Role updated' : 'Role created');
        this.showForm = false;
        this.load();
        this.rolesService.load(true);
        this.saving = false;
      },
      error: () => { this.saving = false; },
    });
  }

  delete(role: RoleDef): void {
    if (role.isSystem) { this.toastr.warning('System roles cannot be deleted'); return; }
    if (!confirm(`Delete role "${role.label}"?`)) return;
    this.api.delete(`admin/role-definitions/${role.id}`).subscribe({
      next: () => { this.toastr.success('Role deleted'); this.load(); this.rolesService.load(true); },
    });
  }

  seed(): void {
    this.api.post('admin/role-definitions/seed', {}).subscribe({
      next: (res: any) => { this.toastr.success(res.message); this.load(); this.rolesService.load(true); },
    });
  }

  colorClass(color: string): string {
    return ROLE_COLOR_MAP[color] ?? 'bg-gray-100 text-gray-700';
  }
}
