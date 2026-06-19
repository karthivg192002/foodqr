import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { DiningTable } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({ selector: 'app-dining-tables', templateUrl: './dining-tables.component.html' })
export class DiningTablesComponent implements OnInit {
  tables: DiningTable[] = [];
  waiters: any[] = [];
  loading = false;
  showForm = false;
  editingId: string | null = null;
  saving = false;
  form: FormGroup;
  selectedQr: DiningTable | null = null;

  constructor(private api: ApiService, private toastr: ToastrService, private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({ name: ['', Validators.required], capacity: [4], waiterId: [''] });
  }

  ngOnInit(): void {
    this.load();
    if (!this.auth.isWaiter) {
      this.api.get<any>('admin/staff', { limit: 200 }).subscribe({
        next: (res) => {
          const list: any[] = Array.isArray(res) ? res : (res?.data || []);
          this.waiters = list.filter((u: any) => u.role === 'waiter');
        },
      });
    }
  }

  load(): void {
    this.loading = true;
    this.api.get<DiningTable[]>('admin/dining-tables').subscribe({
      next: (data) => { this.tables = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void { this.editingId = null; this.form.reset({ capacity: 4 }); this.showForm = true; }

  openEdit(t: DiningTable): void { this.editingId = t.id; this.form.patchValue(t); this.showForm = true; }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.editingId
      ? this.api.patch(`admin/dining-tables/${this.editingId}`, this.form.value)
      : this.api.post('admin/dining-tables', this.form.value);
    req.subscribe({
      next: () => { this.toastr.success('Saved'); this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  regenerateQr(id: string): void {
    this.api.post(`admin/dining-tables/${id}/regenerate-qr`, {}).subscribe({
      next: (table: any) => { this.toastr.success('QR regenerated'); this.load(); },
    });
  }

  downloadQr(table: DiningTable): void {
    const url = `${environment.apiUrl}/admin/dining-tables/${table.id}/qr/download`;
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'image/png' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `table-${table.name.replace(/\s+/g, '-')}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        this.toastr.success('QR code downloaded');
      } else {
        this.toastr.error('Failed to download QR code');
      }
    };
    xhr.onerror = () => this.toastr.error('Download failed');
    xhr.send();
  }

  delete(id: string): void {
    if (!confirm('Delete this table?')) return;
    this.api.delete(`admin/dining-tables/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.load(); },
    });
  }

  getStatusBadge(status: string): string {
    return { available: 'badge-success', occupied: 'badge-warning', reserved: 'badge-info' }[status] || 'badge-gray';
  }
}
