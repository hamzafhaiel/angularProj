import type { ValidatorFn } from '@angular/forms';

export const calendarDate: ValidatorFn = control => {
  if (!control.value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(control.value)) return { date: true };
  const [year, month, day] = String(control.value).split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? null : { date: true };
};

export const trimmedRequired: ValidatorFn = control => String(control.value ?? '').trim() ? null : { required: true };
