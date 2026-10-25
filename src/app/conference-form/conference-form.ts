import { Component, computed, effect, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Conference, ConferenceDraft } from '../conference';
import { conferenceDate, integer, participantLimit, trimmedText } from './conference-validators';

const EMPTY = { title: '', description: '', category: '', place: '', date: '', maxParticipants: null, nbParticipants: 0 };

@Component({
  selector: 'app-conference-form',
  imports: [ReactiveFormsModule],
  templateUrl: './conference-form.html',
  styleUrl: './conference-form.css',
})
export class ConferenceForm {
  readonly conference = input<Conference | null>(null);
  readonly saving = input(false);
  readonly saved = output<ConferenceDraft>();
  readonly submitted = signal(false);
  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100), trimmedText(3)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000), trimmedText(10)] }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50), trimmedText(2)] }),
    place: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(120), trimmedText(2)] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required, conferenceDate(() => this.conference()?.date)] }),
    maxParticipants: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(100000), integer]),
    nbParticipants: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100000), integer]),
  }, { validators: participantLimit });

  readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  readonly isValid = computed(() => this.formStatus() === 'VALID');
  readonly titleLength = computed(() => this.formValue().title?.length ?? 0);
  readonly descriptionLength = computed(() => this.formValue().description?.length ?? 0);
  readonly availablePlaces = computed(() => {
    const value = this.formValue();
    return value.maxParticipants != null && value.nbParticipants != null
      ? Math.max(0, value.maxParticipants - value.nbParticipants) : 0;
  });
  readonly textFields = [
    { key: 'title', label: 'Title', min: 3, max: 100 },
    { key: 'description', label: 'Description', min: 10, max: 2000 },
    { key: 'category', label: 'Category', min: 2, max: 50 },
    { key: 'place', label: 'Place', min: 2, max: 120 },
  ] as const;

  constructor() {
    effect(() => {
      const conference = this.conference();
      this.form.reset(conference ?? EMPTY);
      this.submitted.set(false);
    });
  }

  reset(): void {
    this.form.reset(this.conference() ?? EMPTY);
    this.submitted.set(false);
  }

  submit(): void {
    if (this.saving()) return;
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (!this.form.valid) return;
    const value = this.form.getRawValue();
    if (value.maxParticipants === null || value.nbParticipants === null) return;
    this.saved.emit({ ...value, maxParticipants: value.maxParticipants, nbParticipants: value.nbParticipants,
      title: value.title.trim(), description: value.description.trim(), category: value.category.trim(), place: value.place.trim() });
  }
}
