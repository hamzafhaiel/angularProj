import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONFERENCES } from '../conferences';

@Component({
  selector: 'app-conference-list',
  imports: [RouterLink],
  templateUrl: './conference-list.html',
  styleUrl: './conference-list.css',
})
export class ConferenceList {
  readonly conferences = CONFERENCES;
}
