import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface RoleDef {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  isSystem: boolean;
  isActive: boolean;
}

export const ROLE_COLOR_MAP: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-800',
  blue:   'bg-blue-100 text-blue-800',
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray:   'bg-gray-100 text-gray-700',
  indigo: 'bg-indigo-100 text-indigo-800',
  orange: 'bg-orange-100 text-orange-800',
  red:    'bg-red-100 text-red-800',
  teal:   'bg-teal-100 text-teal-800',
  pink:   'bg-pink-100 text-pink-800',
};

const DEFAULT_ROLES: RoleDef[] = [
  { id: '', name: 'admin',          label: 'Admin',          description: '', color: 'purple', isSystem: true,  isActive: true },
  { id: '', name: 'branch_manager', label: 'Branch Manager', description: '', color: 'blue',   isSystem: true,  isActive: true },
  { id: '', name: 'waiter',         label: 'Waiter',         description: '', color: 'green',  isSystem: true,  isActive: true },
  { id: '', name: 'chef',           label: 'Chef',           description: '', color: 'yellow', isSystem: true,  isActive: true },
  { id: '', name: 'staff',          label: 'Staff',          description: '', color: 'gray',   isSystem: true,  isActive: true },
  { id: '', name: 'pos_operator',   label: 'POS Operator',   description: '', color: 'indigo', isSystem: true,  isActive: true },
  { id: '', name: 'customer',       label: 'Customer',       description: '', color: 'orange', isSystem: true,  isActive: true },
];

@Injectable({ providedIn: 'root' })
export class RolesService {
  private _roles$ = new BehaviorSubject<RoleDef[]>(DEFAULT_ROLES);
  readonly roles$ = this._roles$.asObservable();
  private loaded = false;

  constructor(private api: ApiService) {}

  load(force = false): void {
    if (this.loaded && !force) return;
    this.api.get<RoleDef[]>('admin/role-definitions/public').subscribe({
      next: (roles) => {
        if (roles?.length) {
          this._roles$.next(roles);
          this.loaded = true;
        }
      },
    });
  }

  get roles(): RoleDef[] { return this._roles$.value; }

  getLabel(name: string): string {
    return this._roles$.value.find((r) => r.name === name)?.label ?? name;
  }

  getClass(name: string): string {
    const color = this._roles$.value.find((r) => r.name === name)?.color ?? 'gray';
    return ROLE_COLOR_MAP[color] ?? 'bg-gray-100 text-gray-700';
  }
}
