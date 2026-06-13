import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface OrderEvent {
  type: 'order:created' | 'order:updated';
  orderId: string;
  status?: string;
  branchId?: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private sources = new Map<string, EventSource>();

  constructor(private authService: AuthService) {}

  /** Subscribe to SSE events from a backend endpoint.
   *  Returns an Observable that emits OrderEvent objects.
   *  The SSE connection is automatically closed when the observable is unsubscribed.
   */
  listen(endpoint: string, params: Record<string, string> = {}): Observable<OrderEvent> {
    return new Observable((observer) => {
      const token = this.authService.token;
      const qs = new URLSearchParams({ ...params, token: token || '' }).toString();
      const url = `${environment.apiUrl}/${endpoint}?${qs}`;

      const es = new EventSource(url);
      this.sources.set(url, es);

      es.onmessage = (e) => {
        try { observer.next(JSON.parse(e.data)); } catch {}
      };
      es.onerror = () => {
        // EventSource auto-reconnects; we just ignore transient errors
      };

      return () => {
        es.close();
        this.sources.delete(url);
      };
    });
  }

  ngOnDestroy(): void {
    this.sources.forEach((es) => es.close());
  }
}
