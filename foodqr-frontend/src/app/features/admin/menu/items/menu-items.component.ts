import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../core/services/api.service';
import { Item, ItemCategory } from '../../../../core/models';

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
  itemTypes = [
    { value: 'veg', label: 'Veg' },
    { value: 'non_veg', label: 'Non Veg' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'beverage', label: 'Beverage' },
  ];

  uploadingImage = false;

  addons: any[] = [];
  addonItemId = '';

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
      thumbImage: [''],
      calories: [''], protein: [''], carbs: [''], fat: [''],
      variations: this.fb.array([]),
    });
  }

  get variations(): FormArray {
    return this.form.get('variations') as FormArray;
  }

  addVariation(): void {
    this.variations.push(this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      additionalPrice: [0],
      attributeName: [''],
      priceType: ['addon'],
      status: [true],
    }));
  }

  removeVariation(index: number): void {
    this.variations.removeAt(index);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage = true;
    this.api.upload('upload/image', file).subscribe({
      next: (res) => { this.form.patchValue({ thumbImage: res.url }); this.uploadingImage = false; },
      error: () => { this.toastr.error('Image upload failed'); this.uploadingImage = false; },
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
    this.api.get<any>('admin/items', params).subscribe({
      next: (res) => {
        this.items = Array.isArray(res) ? res : (res?.data || []);
        this.total = Array.isArray(res) ? res.length : (res?.total || 0);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.variations.clear();
    this.addons = [];
    this.addonItemId = '';
    this.form.reset({ status: true, itemType: 'veg', price: 0, taxRate: 0, thumbImage: '' });
    this.showForm = true;
  }

  openEdit(item: Item): void {
    this.editingId = item.id;
    this.variations.clear();
    (item.variations || []).forEach((v) => this.variations.push(this.fb.group({
      name: [v.name, Validators.required],
      price: [v.price, [Validators.required, Validators.min(0)]],
      additionalPrice: [v.additionalPrice ?? 0],
      attributeName: [v.attributeName ?? ''],
      priceType: [(v as any).priceType ?? 'addon'],
      status: [v.status ?? true],
    })));
    const { variations, ...rest } = item as any;
    this.form.patchValue(rest);
    this.addonItemId = '';
    this.loadAddons(item.id);
    this.showForm = true;
  }

  loadAddons(itemId: string): void {
    this.api.get<any[]>(`item-addons/item/${itemId}`).subscribe({
      next: (res) => { this.addons = res || []; },
      error: () => { this.addons = []; },
    });
  }

  get availableAddonItems(): Item[] {
    return this.items.filter((i) => i.id !== this.editingId && !this.addons.some((a) => a.addonItemId === i.id));
  }

  addAddon(): void {
    if (!this.editingId || !this.addonItemId) return;
    this.api.post('item-addons', { itemId: this.editingId, addonItemId: this.addonItemId }).subscribe({
      next: () => { this.toastr.success('Addon linked'); this.addonItemId = ''; this.loadAddons(this.editingId!); },
    });
  }

  removeAddon(id: string): void {
    this.api.delete(`item-addons/${id}`).subscribe({
      next: () => { this.loadAddons(this.editingId!); },
    });
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
