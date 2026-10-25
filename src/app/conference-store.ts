import { Injectable, signal } from '@angular/core';
import type { Conference, ConferenceDraft } from './conference';
import { CONFERENCES } from './conferences';
import { isConferenceDraft, todayDate } from './conference-data';

const STORAGE_KEY = 'angularProj.conferences';

@Injectable({ providedIn: 'root' })
export class ConferenceStore {
  private readonly items = signal<readonly Conference[]>(this.restore());
  readonly conferences = this.items.asReadonly();

  find(id: string | number | null): Conference | undefined {
    return this.conferences().find(conference => String(conference.id) === String(id));
  }

  save(draft: ConferenceDraft, id?: number): Conference {
    const original = id === undefined ? undefined : this.find(id);
    if (id !== undefined && !original) throw new Error('Conference not found.');
    if (!isConferenceDraft(draft)) throw new Error('Check the conference fields and participant limits.');
    if (draft.date < todayDate() && draft.date !== original?.date) {
      throw new Error('Choose today or a future date.');
    }
    const nextId = Math.max(0, ...this.conferences().map(conference => conference.id)) + 1;
    if (!Number.isSafeInteger(nextId)) throw new Error('Unable to allocate a conference ID.');
    const conference: Conference = {
      ...draft, id: id ?? nextId, title: draft.title.trim(), description: draft.description.trim(),
      category: draft.category.trim(), place: draft.place.trim(),
    };
    const next = original
      ? this.conferences().map(item => item.id === id ? conference : item)
      : [...this.conferences(), conference];
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      throw new Error('Unable to save the conference. Enable browser session storage and try again.');
    }
    this.items.set(next);
    return conference;
  }

  private restore(): readonly Conference[] {
    try {
      const data: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
      if (Array.isArray(data) && data.length >= CONFERENCES.length
        && data.every(item => isConferenceDraft(item) && 'id' in item && typeof item.id === 'number'
          && Number.isSafeInteger(item.id) && item.id > 0)
        && new Set(data.map(item => item.id)).size === data.length
        && CONFERENCES.every(seed => data.some(item => item.id === seed.id))) return data;
    } catch { /* Invalid or inaccessible session data falls back to the sample conferences. */ }
    return CONFERENCES.map(conference => ({ ...conference }));
  }
}
