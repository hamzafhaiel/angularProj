import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../environments/environment';
import type { Conference, ConferenceDraft } from './conference';

export class ConferenceApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

@Injectable({ providedIn: 'root' })
export class ConferenceApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/conferences`;

  getAll(place?: string): Observable<Conference[]> {
    const params = place ? new HttpParams().set('place', place) : new HttpParams();
    return this.request(this.http.get<Conference[]>(this.url, { params }));
  }

  getById(id: number): Observable<Conference> {
    return this.request(this.http.get<Conference>(`${this.url}/${id}`));
  }

  create(draft: ConferenceDraft): Observable<Conference> {
    return this.request(this.http.post<Conference>(this.url, draft));
  }

  update(conference: Conference): Observable<Conference> {
    return this.request(this.http.put<Conference>(`${this.url}/${conference.id}`, conference));
  }

  updateCapacity(id: number, maxParticipants: number): Observable<Conference> {
    return this.request(this.http.patch<Conference>(`${this.url}/${id}`, { maxParticipants }));
  }

  remove(id: number): Observable<void> {
    return this.request(this.http.delete<void>(`${this.url}/${id}`));
  }

  private request<T>(request: Observable<T>): Observable<T> {
    return request.pipe(timeout(10000), catchError((error: unknown) => {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      const message = status === 0 ? 'API unreachable. Start the backend with npm run api, then retry.'
        : status === 404 ? 'Conference not found (404). Reload the list.'
        : `The API request failed (${status}). Please retry.`;
      return throwError(() => new ConferenceApiError(status, message));
    }));
  }
}
