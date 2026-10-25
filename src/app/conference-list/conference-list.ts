import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConferenceStore } from '../conference-store';

@Component({
  selector: 'app-conference-list',
  imports: [RouterLink],
  templateUrl: './conference-list.html',
  styleUrl: './conference-list.css',
})
export class ConferenceList {
  readonly conferences = inject(ConferenceStore).conferences;
}
