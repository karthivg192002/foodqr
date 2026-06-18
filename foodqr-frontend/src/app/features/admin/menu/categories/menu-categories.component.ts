import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../core/services/api.service';
import { ItemCategory } from '../../../../core/models';

@Component({ selector: 'app-menu-categories', templateUrl: './menu-categories.component.html' })
export class MenuCategoriesComponent implements OnInit {
  categories: ItemCategory[] = [];
  loading = false;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: FormGroup;

  uploadingImage = false;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({ name: ['', Validators.required], description: [''], icon: [''], image: [''], status: [true] });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage = true;
    this.api.upload('upload/image', file).subscribe({
      next: (res) => { this.form.patchValue({ image: res.url }); this.uploadingImage = false; },
      error: () => { this.toastr.error('Image upload failed'); this.uploadingImage = false; },
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<ItemCategory[]>('admin/categories').subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void { this.editingId = null; this.form.reset({ status: true, image: '' }); this.showForm = true; }

  openEdit(cat: ItemCategory): void {
    this.editingId = cat.id;
    this.form.patchValue(cat);
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.editingId
      ? this.api.patch(`admin/categories/${this.editingId}`, this.form.value)
      : this.api.post('admin/categories', this.form.value);

    req.subscribe({
      next: () => { this.toastr.success(this.editingId ? 'Updated' : 'Created'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.api.delete(`admin/categories/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.load(); },
    });
  }
}
