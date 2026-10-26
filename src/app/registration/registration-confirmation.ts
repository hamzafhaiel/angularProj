import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ConferenceStore } from '../conference-store';
import { RegistrationStore } from './registration-store';

@Component({
  selector: 'app-registration-confirmation',
  imports: [RouterLink],
  template: `
    @if (store.loading()) { <p role="status">Loading conference...</p> }
    @else if (store.error()) { <p role="alert">{{ store.error() }}</p><button type="button" (click)="store.load()">Retry</button> }
    @else if (conference(); as selected) {
      @if (registrations.isRegistered(selected.id)) {
        <h1>Registration confirmed</h1>
        <p role="status">Your registration for {{ selected.title }} is saved in this browser session.</p>
        <p>{{ selected.date }} · {{ selected.place }}</p>
      } @else {
        <h1>No registration found</h1>
        <p>Register for {{ selected.title }} before opening its confirmation.</p>
        <a [routerLink]="['/registration', selected.id]">Register for this conference</a>
      }
      <p><a [routerLink]="['/list', selected.id]">View conference details</a></p>
    } @else {
      <h1>Conference not found</h1>
    }
    <p><a routerLink="/list">Back to conferences</a></p>
  `,
})
export class RegistrationConfirmation {
  protected readonly registrations = inject(RegistrationStore);
  protected readonly store = inject(ConferenceStore);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('id'))));
  protected readonly conference = computed(() => this.store.find(this.id() ?? null));
}
