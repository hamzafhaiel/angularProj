import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ConferenceStore } from '../conference-store';
import { ConferenceDetails } from '../conference-details/conference-details';
import { Notfound } from '../notfound/notfound';

@Component({
  selector: 'app-conference-page',
  imports: [ConferenceDetails, RouterLink, Notfound],
  template: `
    <a routerLink="/list">Back to conferences</a>
    @if (store.loading()) { <p role="status">Loading conference...</p> }
    @else if (store.error()) {
      <p role="alert">{{ store.error() }}</p><button type="button" (click)="store.load()">Retry</button>
    }
    @else if (conference(); as selected) {
      <app-conference-details [conf]="selected" (closed)="backToList()" />
      <p><button type="button" [disabled]="store.mutating() || selected.maxParticipants > 99990" (click)="increaseCapacity(selected.id, selected.maxParticipants)">Add 10 places</button></p>
    } @else {
      <h1>Conference not found</h1>
      <app-notfound />
    }
  `,
})
export class ConferencePage {
  private readonly router = inject(Router);
  protected readonly store = inject(ConferenceStore);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('id'))));
  readonly conference = computed(() => this.store.find(this.id() ?? null) ?? null);

  backToList(): void {
    void this.router.navigate(['/list']);
  }

  async increaseCapacity(id: number, current: number): Promise<void> {
    try { await this.store.updateCapacity(id, current + 10); } catch { /* Store error is shown above. */ }
  }
}
