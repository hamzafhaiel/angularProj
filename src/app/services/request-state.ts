import { Observable, catchError, map, of, startWith } from 'rxjs';

export type RequestState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

export function loadingState<T>(): RequestState<T> {
  return { status: 'loading', data: null, error: null };
}

export function requestState<T>(source: Observable<T>): Observable<RequestState<T>> {
  return source.pipe(
    map(data => ({ status: 'ready', data, error: null }) as RequestState<T>),
    startWith(loadingState<T>()),
    catchError((error: unknown) => of<RequestState<T>>({
      status: 'error', data: null, error: error instanceof Error ? error : new Error('Unable to load conferences.'),
    })),
  );
}
