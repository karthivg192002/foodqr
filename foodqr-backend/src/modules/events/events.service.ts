import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface OrderEvent {
  type: 'order:created' | 'order:updated';
  orderId: string;
  status?: string;
  branchId?: string;
  data?: any;
}

@Injectable()
export class EventsService {
  private readonly subject$ = new Subject<OrderEvent>();

  emit(event: OrderEvent): void {
    this.subject$.next(event);
  }

  stream(branchId?: string): Observable<OrderEvent> {
    return new Observable((observer) => {
      const sub = this.subject$
        .pipe(filter((e) => !branchId || !e.branchId || e.branchId === branchId))
        .subscribe(observer);
      return () => sub.unsubscribe();
    });
  }
}
