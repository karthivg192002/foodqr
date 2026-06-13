import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

const WIDGET_TYPES = [
  { value: 'counter', label: 'Counter' },
  { value: 'chart', label: 'Chart' },
  { value: 'table', label: 'Table' },
];

const METRIC_KEYS = [
  { value: 'orders_count', label: 'Total Orders' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'top_items', label: 'Top Items' },
  { value: 'customers', label: 'Customers' },
  { value: 'loyalty_stamps', label: 'Loyalty Stamps' },
  { value: 'pending_orders', label: 'Pending Orders' },
];

@Component({
  selector: 'app-analytics-sections',
  templateUrl: './analytics-sections.component.html',
})
export class AnalyticsSectionsComponent implements OnInit {
  sections: any[] = [];
  loading = false;
  showModal = false;
  editing: any = null;
  form: any = { title: '', widgetType: 'counter', metricKey: '', isVisible: true, sortOrder: 0 };
  widgetTypes = WIDGET_TYPES;
  metricKeys = METRIC_KEYS;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<any[]>('admin/analytics-sections').subscribe({
      next: (d) => { this.sections = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editing = null;
    this.form = { title: '', widgetType: 'counter', metricKey: '', isVisible: true, sortOrder: this.sections.length };
    this.showModal = true;
  }

  openEdit(section: any): void {
    this.editing = section;
    this.form = { ...section };
    this.showModal = true;
  }

  save(): void {
    if (!this.form.title) { this.toastr.warning('Title is required'); return; }
    const req = this.editing
      ? this.api.patch(`admin/analytics-sections/${this.editing.id}`, this.form)
      : this.api.post('admin/analytics-sections', this.form);
    req.subscribe({
      next: () => { this.toastr.success('Saved'); this.showModal = false; this.load(); },
    });
  }

  remove(id: string): void {
    if (!confirm('Delete this widget?')) return;
    this.api.delete(`admin/analytics-sections/${id}`).subscribe({
      next: () => { this.toastr.success('Deleted'); this.load(); },
    });
  }

  toggle(section: any): void {
    this.api.patch(`admin/analytics-sections/${section.id}`, { isVisible: !section.isVisible }).subscribe({
      next: () => { section.isVisible = !section.isVisible; },
    });
  }

  widgetLabel(type: string): string { return this.widgetTypes.find((w) => w.value === type)?.label || type; }
  metricLabel(key: string): string { return this.metricKeys.find((m) => m.value === key)?.label || key; }
}
