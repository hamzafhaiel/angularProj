import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, finalize, of, switchMap } from 'rxjs';
import { Conferance, ConferenceHttpError } from '../services/conferance';
import type { Conference } from '../services/conference.model';
import { loadingState, requestState, type RequestState } from '../services/request-state';
import { calendarDate, trimmedRequired } from '../services/conference-validators';

@Component({
  selector: 'app-conferance-details',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './conferance-details.html',
  styleUrl: './conferance-details.css',
})
export class ConferanceDetails {
  private readonly conferenceService = inject(Conferance);
  private readonly r = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly reload = signal(0);
  readonly id = input.required<string>();
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly updateError = signal('');
  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, trimmedRequired, Validators.maxLength(100)]],
    date: ['', [Validators.required, calendarDate]],
    place: ['', [Validators.required, trimmedRequired, Validators.maxLength(120)]],
  });
  private readonly formStatus = toSignal(this.editForm.statusChanges, { initialValue: this.editForm.status });
  readonly canSave = computed(() => this.formStatus() === 'VALID' && !this.saving());
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

  constructor() {
    effect(() => {
      this.id();
      this.editing.set(false);
      this.updateError.set('');
    });
  }

  retry(): void { this.reload.update(value => value + 1); }
  goBack(): void { void this.r.navigate(['/list']); }

  modifier(): void {
    const conference = this.conference();
    if (!conference || this.saving()) return;
    this.editForm.reset({ name: conference.name, date: conference.date, place: conference.place });
    this.updateError.set('');
    this.editing.set(true);
  }

  annuler(): void {
    if (!this.saving()) { this.editing.set(false); this.updateError.set(''); }
  }

  enregistrer(): void {
    if (this.saving() || !this.editing()) return;
    this.editForm.markAllAsTouched();
    this.editForm.updateValueAndValidity();
    const conference = this.conference();
    if (!conference || !this.editForm.valid) return;
    const values = this.editForm.getRawValue();
    const submittedId = String(conference.id);
    this.saving.set(true);
    this.updateError.set('');
    this.conferenceService.update({ ...values, id: conference.id, name: values.name.trim(), place: values.place.trim() }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        if (this.id() === submittedId) { this.editing.set(false); this.retry(); }
      },
      error: (error: unknown) => {
        if (this.id() === submittedId) this.updateError.set(error instanceof Error ? error.message : 'Unable to update conference.');
      },
    });
  }
}
