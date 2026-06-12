import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../core/services/api.service';
import { Item } from '../../../../core/models';

@Component({
  selector: 'app-menu-extras',
  templateUrl: './menu-extras.component.html',
})
export class MenuExtrasComponent implements OnInit {
  items: Item[] = [];
  selectedItem: Item | null = null;
  extras: any[] = [];

  loadingItems = false;
  loadingExtras = false;
  saving = false;

  itemSearch = '';
  showModal = false;
  editingId: string | null = null;
  form: FormGroup;

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      maxQuantity: [1, [Validators.min(1)]],
      isRequired: [false],
      status: [true],
    });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loadingItems = true;
    this.api.get<any>('admin/items?limit=100').subscribe({
      next: (res) => {
        this.items = Array.isArray(res) ? res : (res.data ?? []);
        this.loadingItems = false;
      },
      error: () => { this.loadingItems = false; },
    });
  }

  selectItem(item: Item): void {
    this.selectedItem = item;
    this.loadExtras(item.id);
  }

  loadExtras(itemId: string): void {
    this.loadingExtras = true;
    this.api.get<any>(`admin/items/${itemId}/extras`).subscribe({
      next: (res) => {
        this.extras = Array.isArray(res) ? res : (res.data ?? []);
        this.loadingExtras = false;
      },
      error: () => { this.loadingExtras = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ price: 0, maxQuantity: 1, isRequired: false, status: true });
    this.showModal = true;
  }

  openEdit(extra: any): void {
    this.editingId = extra.id;
    this.form.patchValue(extra);
    this.showModal = true;
  }

  save(): void {
    if (!this.selectedItem) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const itemId = this.selectedItem.id;
    const req = this.editingId
      ? this.api.patch(`admin/items/${itemId}/extras/${this.editingId}`, this.form.value)
      : this.api.post(`admin/items/${itemId}/extras`, this.form.value);

    req.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Extra updated' : 'Extra added');
        this.showModal = false;
        this.saving = false;
        this.loadExtras(itemId);
      },
      error: () => { this.saving = false; },
    });
  }

  delete(extraId: string): void {
    if (!this.selectedItem || !confirm('Delete this extra?')) return;
    this.api.delete(`admin/items/${this.selectedItem.id}/extras/${extraId}`).subscribe({
      next: () => {
        this.toastr.success('Extra deleted');
        this.loadExtras(this.selectedItem!.id);
      },
    });
  }

  get filteredItems(): Item[] {
    if (!this.itemSearch) return this.items;
    const q = this.itemSearch.toLowerCase();
    return this.items.filter((i) => i.name.toLowerCase().includes(q));
  }
}
