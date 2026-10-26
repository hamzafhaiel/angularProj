import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = signal(0);
  readonly deletingId = signal<number | null>(null);
  readonly deleteError = signal('');
  readonly message = signal('');
  readonly state = toSignal(toObservable(this.reload).pipe(
    switchMap(() => requestState(this.conferenceService.getAll())),
  ), { initialValue: loadingState<Conference[]>() });
  readonly conferances = computed(() => this.state().data ?? []);

  retry(): void { this.reload.update(value => value + 1); }

  supprimer(id: number): void {
    if (this.deletingId() !== null) return;
    this.deletingId.set(id);
    this.deleteError.set('');
    this.message.set('');
    this.conferenceService.delete(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.deletingId.set(null)),
    ).subscribe({
      next: () => {
        this.message.set('Conference deleted.');
        this.retry();
      },
      error: (error: unknown) => this.deleteError.set(error instanceof Error ? error.message : 'Unable to delete conference.'),
    });
  }
}
