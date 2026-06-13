import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({ selector: 'app-messaging', templateUrl: './messaging.component.html' })
export class MessagingComponent implements OnInit {
  branches: any[] = [];
  selectedBranchId = '';
  threads: any[] = [];
  selectedThread: any = null;
  history: any[] = [];
  newMessage = '';
  loading = false;
  sending = false;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.api.get<any[]>('admin/branches').subscribe({ next: (b) => { this.branches = b; if (b.length) { this.selectedBranchId = b[0].id; this.loadThreads(); } } });
  }

  loadThreads(): void {
    if (!this.selectedBranchId) return;
    this.loading = true;
    this.api.get<any[]>(`messaging/branch/${this.selectedBranchId}/threads`).subscribe({
      next: (d) => { this.threads = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openThread(thread: any): void {
    this.selectedThread = thread;
    this.api.get<any[]>(`messaging/thread/${thread.id}/history`).subscribe({
      next: (h) => { this.history = h; },
    });
    this.api.post(`messaging/thread/${thread.id}/read`, {}).subscribe();
  }

  send(): void {
    if (!this.newMessage.trim() || !this.selectedThread) return;
    this.sending = true;
    this.api.post(`messaging/thread/${this.selectedThread.id}/send`, { text: this.newMessage }).subscribe({
      next: (msg: any) => { this.history.push(msg); this.newMessage = ''; this.sending = false; },
      error: () => { this.sending = false; },
    });
  }

  onBranchChange(): void { this.selectedThread = null; this.history = []; this.loadThreads(); }
}
