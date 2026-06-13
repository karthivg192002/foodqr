import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../core/services/api.service';

@Component({ selector: 'app-item-attributes', templateUrl: './item-attributes.component.html' })
export class ItemAttributesComponent implements OnInit {
  attributes: any[] = [];
  categories: any[] = [];
  loading = false;
  showForm = false;
  saving = false;
  editingId: string | null = null;
  form: FormGroup;

  showAssignForm = false;
  assignData: { attributeId: string; categoryId: string } = { attributeId: '', categoryId: '' };

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({ name: ['', Validators.required], status: [true] });
  }

  ngOnInit(): void {
    this.load();
    this.api.get<any[]>('frontend/categories').subscribe({ next: (c) => this.categories = c });
  }

  load(): void {
    this.loading = true;
    this.api.get<any[]>('admin/item-attributes').subscribe({
      next: (d) => { this.attributes = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void { this.editingId = null; this.form.reset({ status: true }); this.showForm = true; }

  openEdit(a: any): void { this.editingId = a.id; this.form.patchValue(a); this.showForm = true; }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.editingId
      ? this.api.patch(`admin/item-attributes/${this.editingId}`, this.form.value)
      : this.api.post('admin/item-attributes', this.form.value);
    req.subscribe({
      next: () => { this.toastr.success(this.editingId ? 'Updated' : 'Created'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this attribute?')) return;
    this.api.delete(`admin/item-attributes/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.load(); },
    });
  }

  assignToCategory(): void {
    if (!this.assignData.attributeId || !this.assignData.categoryId) return;
    this.api.post('admin/item-attributes/assign-to-category', this.assignData).subscribe({
      next: () => { this.toastr.success('Assigned to category'); this.showAssignForm = false; this.load(); },
    });
  }
}
