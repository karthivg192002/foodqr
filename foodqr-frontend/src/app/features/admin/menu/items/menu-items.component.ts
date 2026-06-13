import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../core/services/api.service';
import { Item, ItemCategory, PaginatedResponse } from '../../../../core/models';

@Component({ selector: 'app-menu-items', templateUrl: './menu-items.component.html' })
export class MenuItemsComponent implements OnInit {
  items: Item[] = [];
  categories: ItemCategory[] = [];
  subCategories: ItemCategory[] = [];
  total = 0;
  page = 1;
  limit = 20;
  loading = false;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  search = '';
  filterCategory = '';
  form: FormGroup;
  itemTypes = ['veg', 'non_veg', 'vegan', 'beverage'];

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: [''],
      subCategoryId: [''],
      itemType: ['veg'],
      taxRate: [0],
      isFeatured: [false],
      status: [true],
      calories: [''], protein: [''], carbs: [''], fat: [''],
    });
  }

  ngOnInit(): void {
    this.loadItems();
    this.api.get<ItemCategory[]>('frontend/categories').subscribe({ next: (c) => this.categories = c });
  }

  onCategoryChange(categoryId: string): void {
    const selected = this.categories.find((c) => c.id === categoryId);
    this.subCategories = selected?.children || [];
    this.form.patchValue({ subCategoryId: '' });
  }

  loadItems(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.filterCategory) params.categoryId = this.filterCategory;
    this.api.get<PaginatedResponse<Item>>('admin/items', params).subscribe({
      next: (res) => { this.items = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void { this.editingId = null; this.form.reset({ status: true, itemType: 'veg', price: 0, taxRate: 0 }); this.showForm = true; }

  openEdit(item: Item): void {
    this.editingId = item.id;
    this.form.patchValue(item);
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.editingId
      ? this.api.patch(`admin/items/${this.editingId}`, this.form.value)
      : this.api.post('admin/items', this.form.value);
    req.subscribe({
      next: () => { this.toastr.success(this.editingId ? 'Updated' : 'Created'); this.showForm = false; this.loadItems(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  toggleStatus(item: Item): void {
    this.api.patch(`admin/items/${item.id}/toggle-status`, {}).subscribe({
      next: () => { this.toastr.success('Status updated'); this.loadItems(); },
    });
  }

  toggleFeatured(item: Item): void {
    this.api.patch(`admin/items/${item.id}/toggle-featured`, {}).subscribe({
      next: () => { this.toastr.success('Featured status updated'); this.loadItems(); },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this item?')) return;
    this.api.delete(`admin/items/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.loadItems(); },
    });
  }

  get pages(): number { return Math.ceil(this.total / this.limit); }
}
