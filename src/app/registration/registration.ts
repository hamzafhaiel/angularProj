import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CONFERENCES } from '../conferences';
import { RegistrationStore } from './registration-store';

@Component({
  selector: 'app-registration',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="registration-title">
      <h1 id="registration-title">Registration</h1>
      @if (selection(); as selected) {
        @if (selected.conference; as conference) {
          <h2>{{ conference.name }}</h2>
          <p>{{ conference.date }} · {{ conference.place }}</p>
          <p>Registration is saved in this browser session.</p>
          <button type="button" (click)="register()">
            {{ registrations.isRegistered(conference.id) ? 'View confirmation' : 'Confirm registration' }}
          </button>
          @if (error()) { <p role="alert">{{ error() }}</p> }
          <p><a [routerLink]="['/list', conference.id]">Back to conference details</a></p>
        } @else if (selected.id !== null) {
          <p role="alert">Conference not found. Choose an available conference below.</p>
        }
        @if (!selected.conference) {
          <p>Choose a conference to register:</p>
          <ul>
            @for (conference of conferences; track conference.id) {
              <li><a [routerLink]="['/registration', conference.id]">{{ conference.name }}</a></li>
            }
          </ul>
        }
      }
      <p><a routerLink="/list">Browse conferences</a></p>
    </section>
  `,
})
export class Registration {
  private readonly router = inject(Router);
  protected readonly registrations = inject(RegistrationStore);
  protected readonly conferences = CONFERENCES;
  protected readonly error = signal('');
  protected readonly selection = toSignal(inject(ActivatedRoute).paramMap.pipe(
    map(params => ({
      id: params.get('id'),
      conference: CONFERENCES.find(conference => String(conference.id) === params.get('id')),
    })),
  ));

  protected async register(): Promise<void> {
    this.error.set('');
    const conference = this.selection()?.conference;
    if (!conference) return;
    if (!this.registrations.register(conference.id)) {
      this.error.set('Unable to save registration. Enable browser session storage and try again.');
      return;
    }
    try {
      const navigated = await this.router.navigate(['/registration', conference.id, 'confirmation']);
      if (!navigated) this.error.set('Registration saved. Select View confirmation to try again.');
    } catch {
      this.error.set('Registration saved. Select View confirmation to try again.');
    }
  }
}
