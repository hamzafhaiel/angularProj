import { Component, input, output } from '@angular/core';
import { Conference } from '../conference';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conference-details',
  imports: [RouterLink],
  templateUrl: './conference-details.html',
  styleUrl: './conference-details.css',
})
export class ConferenceDetails {
  readonly conf = input<Conference | null>(null);
  readonly closed = output<void>();
}
