import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, firstValueFrom } from 'rxjs';
import type { Conference, ConferenceDraft } from './conference';
import { ConferenceApi } from './conference-api';
import { isConferenceDraft, todayDate } from './conference-data';

@Injectable({ providedIn: 'root' })
export class ConferenceStore {
  private readonly api = inject(ConferenceApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly items = signal<readonly Conference[]>([]);
  readonly conferences = this.items.asReadonly();
  private readonly isLoading = signal(false);
  private readonly isLoaded = signal(false);
  private readonly isMutating = signal(false);
  private readonly failure = signal<string | null>(null);
  readonly loading = this.isLoading.asReadonly();
  readonly loaded = this.isLoaded.asReadonly();
  readonly mutating = this.isMutating.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly count = computed(() => this.conferences().length);

  constructor() { this.load(); }

  load(): void {
    if (this.loading() || this.mutating()) return;
    this.isLoading.set(true);
    this.isLoaded.set(false);
    this.failure.set(null);
    this.api.getAll().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isLoading.set(false))).subscribe({
      next: data => {
        if (!Array.isArray(data) || !data.every(item => this.isConference(item))
          || new Set(data.map(item => item.id)).size !== data.length) {
          this.failure.set('The API returned invalid conference data.');
          return;
        }
        this.items.set(data);
        this.isLoaded.set(true);
      },
      error: error => this.failure.set(this.message(error)),
    });
  }

  find(id: string | number | null): Conference | undefined {
    return this.conferences().find(conference => String(conference.id) === String(id));
  }

  async save(draft: ConferenceDraft, id?: number): Promise<Conference> {
    this.assertReady();
    const original = id === undefined ? undefined : this.find(id);
    if (id !== undefined && !original) throw new Error('Conference not found.');
    if (!isConferenceDraft(draft)) throw new Error('Check the conference fields and participant limits.');
    if (draft.date < todayDate() && draft.date !== original?.date) {
      throw new Error('Choose today or a future date.');
    }
    const normalized: ConferenceDraft = {
      ...draft, title: draft.title.trim(), description: draft.description.trim(),
      category: draft.category.trim(), place: draft.place.trim(),
    };
    this.isMutating.set(true);
    this.failure.set(null);
    try {
      const conference = await firstValueFrom(original
        ? this.api.update({ ...normalized, id: original.id }) : this.api.create(normalized));
      if (!this.isConference(conference) || (original && conference.id !== original.id)) {
        throw new Error('The API returned invalid conference data. Reload the list before retrying.');
      }
      this.items.update(items => [...items.filter(item => item.id !== conference.id), conference].sort((a, b) => a.id - b.id));
      return conference;
    } catch (error) {
      this.failure.set(this.message(error));
      throw error;
    } finally {
      this.isMutating.set(false);
    }
  }

  async updateCapacity(id: number, maximum: number): Promise<void> {
    this.assertReady();
    const conference = this.find(id);
    if (!conference) throw new Error('Conference not found.');
    if (!isConferenceDraft({ ...conference, maxParticipants: maximum })) throw new Error('Capacity must be a whole number between current participants and 100000.');
    this.isMutating.set(true);
    this.failure.set(null);
    try {
      const updated = await firstValueFrom(this.api.updateCapacity(id, maximum));
      if (!this.isConference(updated) || updated.id !== id) throw new Error('The API returned invalid conference data.');
      this.items.update(items => items.map(item => item.id === id ? updated : item));
    } catch (error) { this.failure.set(this.message(error)); throw error; }
    finally { this.isMutating.set(false); }
  }

  async remove(id: number): Promise<void> {
    this.assertReady();
    if (!this.find(id)) throw new Error('Conference not found.');
    this.isMutating.set(true);
    this.failure.set(null);
    try {
      await firstValueFrom(this.api.remove(id));
      this.items.update(items => items.filter(item => item.id !== id));
    } catch (error) { this.failure.set(this.message(error)); throw error; }
    finally { this.isMutating.set(false); }
  }

  private assertReady(): void {
    if (this.loading() || !this.loaded()) throw new Error('Wait for conferences to load before saving changes.');
    if (this.mutating()) throw new Error('Another change is in progress. Please wait.');
  }

  private isConference(value: unknown): value is Conference {
    return isConferenceDraft(value) && 'id' in value && typeof value.id === 'number'
      && Number.isSafeInteger(value.id) && value.id > 0;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Unable to communicate with the conference API.';
  }
}
