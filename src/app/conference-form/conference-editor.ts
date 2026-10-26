import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import type { ConferenceDraft } from '../conference';
import { ConferenceStore } from '../conference-store';
import { ConferenceForm } from './conference-form';

@Component({
  selector: 'app-conference-editor',
  imports: [ConferenceForm, RouterLink],
  template: `
    <section class="editor">
      <h1>{{ id() ? 'Edit conference' : 'Add conference' }}</h1>
      @if (store.loading()) {
        <p role="status">Loading conferences...</p>
      } @else if (!store.loaded()) {
        <p role="alert">{{ store.error() }}</p><button type="button" (click)="store.load()">Retry</button>
      } @else if (!id() || conference()) {
        <app-conference-form [conference]="conference()" [saving]="saving()" (saved)="save($event)" />
      } @else { <p role="alert">Conference not found.</p> }
      @if (error()) { <p role="alert">{{ error() }}</p> }
      <p><a routerLink="/list">Back to conferences</a></p>
    </section>
  `,
  styles: `.editor { width: 90%; max-width: 720px; margin: auto; padding: 24px 0; } [role="alert"] { color: #a41414; }`,
})
export class ConferenceEditor {
  protected readonly store = inject(ConferenceStore);
  private readonly router = inject(Router);
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('id'))), { initialValue: null });
  readonly conference = computed(() => this.store.find(this.id()) ?? null);
  readonly error = signal('');
  readonly saving = signal(false);
  private savedId: number | undefined;

  constructor() {
    effect(() => {
      this.id();
      this.savedId = undefined;
      this.error.set('');
    });
  }

  async save(draft: ConferenceDraft): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      if (this.id() && !this.conference()) throw new Error('Conference not found.');
      const conference = await this.store.save(draft, this.conference()?.id ?? this.savedId);
      this.savedId = conference.id;
      const navigated = await this.router.navigate(['/list', conference.id]);
      if (!navigated) this.error.set('Conference saved. Open the conference list to view it.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save the conference.');
    } finally {
      this.saving.set(false);
    }
  }
}
