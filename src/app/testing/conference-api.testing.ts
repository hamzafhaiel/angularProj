import { Injectable } from '@angular/core';
import { HttpBackend, HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse, provideHttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { CONFERENCES } from '../conferences';
import type { Conference, ConferenceDraft } from '../conference';

// In-memory HTTP transport for route/component tests. Production uses HttpClient's real backend.
@Injectable()
export class MemoryConferenceBackend implements HttpBackend {
  items: Conference[] = CONFERENCES.map(item => ({ ...item }));
  failNext: HttpErrorResponse | null = null;
  readonly requests: HttpRequest<unknown>[] = [];

  handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.requests.push(request);
    if (this.failNext) {
      const error = this.failNext; this.failNext = null;
      return throwError(() => error);
    }
    const path = new URL(request.url).pathname.split('/').filter(Boolean);
    const id = path.length > 1 ? Number(path[1]) : undefined;
    const found = this.items.find(item => item.id === id);
    if (id !== undefined && !found) return throwError(() => new HttpErrorResponse({ status: 404 }));
    let body: unknown;
    switch (request.method) {
      case 'GET': body = id === undefined ? this.items.filter(item => !request.params.has('place') || item.place === request.params.get('place')).map(item => ({ ...item })) : { ...found }; break;
      case 'POST': {
        const created = { ...(request.body as ConferenceDraft), id: Math.max(0, ...this.items.map(item => item.id)) + 1 };
        this.items.push(created); body = { ...created }; break;
      }
      case 'PUT':
      case 'PATCH': {
        const updated = { ...(request.method === 'PATCH' ? found : {}), ...(request.body as Conference), id: id! } as Conference;
        this.items = this.items.map(item => item.id === id ? updated : item); body = { ...updated }; break;
      }
      case 'DELETE': this.items = this.items.filter(item => item.id !== id); body = {}; break;
      default: return throwError(() => new HttpErrorResponse({ status: 405 }));
    }
    return of(new HttpResponse({ body, status: request.method === 'POST' ? 201 : 200 }));
  }
}

export function provideConferenceTestApi() {
  return [provideHttpClient(), MemoryConferenceBackend, { provide: HttpBackend, useExisting: MemoryConferenceBackend }];
}
