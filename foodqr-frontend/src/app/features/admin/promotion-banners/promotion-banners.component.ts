import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-promotion-banners',
  templateUrl: './promotion-banners.component.html',
})
export class PromotionBannersComponent implements OnInit {
  banners: any[] = [];
  loading = false;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: FormGroup;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
      badgeText: [''],
      badgeColor: ['#FF6B35'],
      linkUrl: [''],
      sortOrder: [0],
      status: [true],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<any[]>('admin/promotion-banners').subscribe({
      next: (d) => { this.banners = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ status: true, sortOrder: 0, badgeColor: '#FF6B35' });
    this.showForm = true;
  }

  openEdit(b: any): void {
    this.editingId = b.id;
    this.form.patchValue({
      ...b,
      startDate: b.startDate ? b.startDate.substring(0, 10) : '',
      endDate: b.endDate ? b.endDate.substring(0, 10) : '',
    });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.editingId
      ? this.api.patch(`admin/promotion-banners/${this.editingId}`, this.form.value)
      : this.api.post('admin/promotion-banners', this.form.value);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Updated' : 'Created');
        this.showForm = false;
        this.load();
        this.saving = false;
      },
      error: () => { this.saving = false; },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this promotion banner?')) return;
    this.api.delete(`admin/promotion-banners/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.load(); },
    });
  }
}
