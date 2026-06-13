import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.component.html',
})
export class MenuManagementComponent implements OnInit {
  menus: any[] = [];
  selectedMenu: any = null;
  sections: any[] = [];
  loading = false;
  sectionsLoading = false;
  showMenuForm = false;
  showSectionForm = false;
  editingMenuId: string | null = null;
  editingSectionId: string | null = null;
  saving = false;

  menuForm: FormGroup;
  sectionForm: FormGroup;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.menuForm = this.fb.group({ name: ['', Validators.required], description: [''], status: [true], sortOrder: [0] });
    this.sectionForm = this.fb.group({ name: ['', Validators.required], description: [''], sortOrder: [0] });
  }

  ngOnInit(): void { this.loadMenus(); }

  loadMenus(): void {
    this.loading = true;
    this.api.get<any[]>('admin/menus').subscribe({
      next: (d) => { this.menus = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  selectMenu(menu: any): void {
    this.selectedMenu = menu;
    this.sectionsLoading = true;
    this.api.get<any[]>(`admin/menus/${menu.id}/sections`).subscribe({
      next: (d) => { this.sections = d; this.sectionsLoading = false; },
      error: () => { this.sectionsLoading = false; },
    });
  }

  openCreateMenu(): void { this.editingMenuId = null; this.menuForm.reset({ status: true, sortOrder: 0 }); this.showMenuForm = true; }
  openEditMenu(m: any): void { this.editingMenuId = m.id; this.menuForm.patchValue(m); this.showMenuForm = true; }

  saveMenu(): void {
    if (this.menuForm.invalid) return;
    this.saving = true;
    const req = this.editingMenuId
      ? this.api.patch(`admin/menus/${this.editingMenuId}`, this.menuForm.value)
      : this.api.post('admin/menus', this.menuForm.value);
    req.subscribe({
      next: () => { this.toastr.success(this.editingMenuId ? 'Updated' : 'Created'); this.showMenuForm = false; this.loadMenus(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  deleteMenu(id: string): void {
    if (!confirm('Delete this menu?')) return;
    this.api.delete(`admin/menus/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); if (this.selectedMenu?.id === id) { this.selectedMenu = null; this.sections = []; } this.loadMenus(); },
    });
  }

  openCreateSection(): void { if (!this.selectedMenu) return; this.editingSectionId = null; this.sectionForm.reset({ sortOrder: 0 }); this.showSectionForm = true; }
  openEditSection(s: any): void { this.editingSectionId = s.id; this.sectionForm.patchValue(s); this.showSectionForm = true; }

  saveSection(): void {
    if (this.sectionForm.invalid || !this.selectedMenu) return;
    this.saving = true;
    const req = this.editingSectionId
      ? this.api.patch(`admin/menus/sections/${this.editingSectionId}`, this.sectionForm.value)
      : this.api.post(`admin/menus/${this.selectedMenu.id}/sections`, this.sectionForm.value);
    req.subscribe({
      next: () => { this.toastr.success(this.editingSectionId ? 'Updated' : 'Created'); this.showSectionForm = false; this.selectMenu(this.selectedMenu); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  deleteSection(id: string): void {
    if (!confirm('Delete this section?')) return;
    this.api.delete(`admin/menus/sections/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.selectMenu(this.selectedMenu); },
    });
  }
}
