import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ConferenceStore } from '../conference-store';
import { RegistrationStore } from './registration-store';

@Component({
  selector: 'app-registration',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="registration-title">
      <h1 id="registration-title">Registration</h1>
      @if (selection(); as selected) {
        @if (selected.conference; as conference) {
          <h2>{{ conference.title }}</h2>
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
            @for (conference of conferences(); track conference.id) {
              <li><a [routerLink]="['/registration', conference.id]">{{ conference.title }}</a></li>
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
  private readonly store = inject(ConferenceStore);
  protected readonly conferences = this.store.conferences;
  protected readonly error = signal('');
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('id'))), { initialValue: null });
  protected readonly selection = computed(() => ({ id: this.id(), conference: this.store.find(this.id()) }));

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
