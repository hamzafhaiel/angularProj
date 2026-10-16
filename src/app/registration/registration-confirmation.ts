import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CONFERENCES } from '../conferences';
import { RegistrationStore } from './registration-store';

@Component({
  selector: 'app-registration-confirmation',
  imports: [RouterLink],
  template: `
    @if (conference(); as selected) {
      @if (registrations.isRegistered(selected.id)) {
        <h1>Registration confirmed</h1>
        <p role="status">Your registration for {{ selected.name }} is saved in this browser session.</p>
        <p>{{ selected.date }} · {{ selected.place }}</p>
      } @else {
        <h1>No registration found</h1>
        <p>Register for {{ selected.name }} before opening its confirmation.</p>
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
  protected readonly conference = toSignal(inject(ActivatedRoute).paramMap.pipe(
    map(params => CONFERENCES.find(conference => String(conference.id) === params.get('id'))),
  ));
}
