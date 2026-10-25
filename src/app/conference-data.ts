import type { ConferenceDraft } from './conference';

export function todayDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isConferenceDraft(value: unknown): value is ConferenceDraft {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  const text = (key: string, min: number, max: number) => typeof data[key] === 'string'
    && (data[key] as string).trim().length >= min && (data[key] as string).length <= max;
  return text('title', 3, 100) && text('description', 10, 2000)
    && text('category', 2, 50) && text('place', 2, 120)
    && isCalendarDate(data['date'])
    && typeof data['maxParticipants'] === 'number' && Number.isInteger(data['maxParticipants'])
    && data['maxParticipants'] >= 1 && data['maxParticipants'] <= 100000
    && typeof data['nbParticipants'] === 'number' && Number.isInteger(data['nbParticipants'])
    && data['nbParticipants'] >= 0 && data['nbParticipants'] <= data['maxParticipants'];
}
