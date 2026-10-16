import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CONFERENCES } from '../conferences';
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
  readonly conference = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(params => CONFERENCES.find(item => String(item.id) === params.get('id')) ?? null),
    ),
  );

  backToList(): void {
    void this.router.navigate(['/list']);
  }
}
