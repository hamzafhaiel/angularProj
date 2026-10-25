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
    @if (conference(); as selected) {
      <app-conference-details [conf]="selected" (closed)="backToList()" />
    } @else {
      <h1>Conference not found</h1>
      <app-notfound />
    }
  `,
})
export class ConferencePage {
  private readonly router = inject(Router);
  private readonly store = inject(ConferenceStore);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('id'))));
  readonly conference = computed(() => this.store.find(this.id() ?? null) ?? null);

  backToList(): void {
    void this.router.navigate(['/list']);
  }
}
