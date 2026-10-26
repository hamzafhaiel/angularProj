import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, of, switchMap } from 'rxjs';
import { Conferance, ConferenceHttpError } from '../services/conferance';
import type { Conference } from '../services/conference.model';
import { loadingState, requestState, type RequestState } from '../services/request-state';

@Component({
  selector: 'app-conferance-details',
  imports: [RouterLink],
  templateUrl: './conferance-details.html',
  styleUrl: './conferance-details.css',
})
export class ConferanceDetails {
  private readonly conferenceService = inject(Conferance);
  private readonly r = inject(Router);
  private readonly reload = signal(0);
  readonly id = input.required<string>();
  readonly state = toSignal(combineLatest([toObservable(this.id), toObservable(this.reload)]).pipe(
    switchMap(([id]) => {
      if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
        return of<RequestState<Conference>>({ status: 'error', data: null, error: new ConferenceHttpError(404, 'Conference not found.') });
      }
      return requestState(this.conferenceService.getById(Number(id)));
    }),
  ), { initialValue: loadingState<Conference>() });
  readonly conference = computed(() => this.state().data);
  readonly notFound = computed(() => {
    const error = this.state().error;
    return error instanceof ConferenceHttpError && error.status === 404;
  });

  retry(): void { this.reload.update(value => value + 1); }
  goBack(): void { void this.r.navigate(['/list']); }
}
