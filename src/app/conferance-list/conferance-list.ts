import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Conferance } from '../services/conferance';
import type { Conference } from '../services/conference.model';
import { loadingState, requestState } from '../services/request-state';

@Component({
  selector: 'app-conferance-list',
  imports: [RouterLink],
  templateUrl: './conferance-list.html',
  styleUrl: './conferance-list.css',
})
export class ConferanceList {
  private readonly conferenceService = inject(Conferance);
  private readonly reload = signal(0);
  readonly state = toSignal(toObservable(this.reload).pipe(
    switchMap(() => requestState(this.conferenceService.getAll())),
  ), { initialValue: loadingState<Conference[]>() });
  readonly conferances = computed(() => this.state().data ?? []);

  retry(): void { this.reload.update(value => value + 1); }
}
