import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Conferance } from '../services/conferance';
import { calendarDate, trimmedRequired } from '../services/conference-validators';

@Component({
  selector: 'app-conferance-add',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './conferance-add.html',
  styleUrl: './conferance-add.css',
})
export class ConferanceAdd {
  private readonly conferenceService = inject(Conferance);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly createdId = signal<number | null>(null);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, trimmedRequired, Validators.maxLength(100)]],
    date: ['', [Validators.required, calendarDate]],
    place: ['', [Validators.required, trimmedRequired, Validators.maxLength(120)]],
  });
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  readonly canSave = computed(() => (this.createdId() !== null || this.status() === 'VALID') && !this.saving());

  async ajouter(): Promise<void> {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.createdId() === null && !this.form.valid) return;
    this.saving.set(true);
    this.error.set('');
    try {
      let id = this.createdId();
      if (id === null) {
        const values = this.form.getRawValue();
        const created = await firstValueFrom(this.conferenceService.add({
          name: values.name.trim(), date: values.date, place: values.place.trim(),
        }).pipe(takeUntilDestroyed(this.destroyRef)));
        id = created.id;
        this.createdId.set(id);
      }
      const navigated = await this.router.navigate(['/details', id]);
      if (!navigated) this.error.set('Conférence ajoutée. Cliquez sur Voir la conférence pour réessayer la navigation.');
    } catch (error) {
      this.error.set(this.createdId() !== null
        ? 'Conférence ajoutée. Cliquez sur Voir la conférence pour réessayer la navigation.'
        : error instanceof Error ? error.message : 'Impossible d’ajouter la conférence.');
    } finally {
      this.saving.set(false);
    }
  }
}
