import { Injectable, signal } from '@angular/core';
import { CONFERENCES } from '../conferences';

const STORAGE_KEY = 'angularProj.registeredConferences';

@Injectable({ providedIn: 'root' })
export class RegistrationStore {
  private readonly registeredIds = signal<number[]>(this.restore());

  isRegistered(id: number): boolean {
    return this.registeredIds().includes(id);
  }

  register(id: number): boolean {
    if (!CONFERENCES.some(conference => conference.id === id)) return false;
    const ids = [...new Set([...this.registeredIds(), id])];
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      this.registeredIds.set(ids);
      return true;
    } catch {
      return false;
    }
  }

  private restore(): number[] {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(stored)
        ? CONFERENCES.filter(conference => stored.includes(conference.id)).map(conference => conference.id)
        : [];
    } catch {
      return [];
    }
  }
}
