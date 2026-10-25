import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isCalendarDate, todayDate } from '../conference-data';

export const integer: ValidatorFn = control => control.value === null || control.value === ''
  || Number.isInteger(control.value) ? null : { integer: true };

export function trimmedText(min: number): ValidatorFn {
  return control => {
    const value = String(control.value ?? '').trim();
    return !value ? { required: true }
      : value.length < min ? { minlength: { requiredLength: min, actualLength: value.length } } : null;
  };
}

export function conferenceDate(existing: () => string | undefined): ValidatorFn {
  return control => {
    if (!control.value) return null; // Validators.required handles an empty value.
    if (!isCalendarDate(control.value)) return { date: true };
    return control.value < todayDate() && control.value !== existing() ? { pastDate: true } : null;
  };
}

export function participantLimit(group: AbstractControl): ValidationErrors | null {
  const maximum = group.get('maxParticipants')?.value;
  const current = group.get('nbParticipants')?.value;
  return typeof maximum === 'number' && typeof current === 'number' && current > maximum
    ? { participantLimit: true } : null;
}
