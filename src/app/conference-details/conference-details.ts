import { Component, input, output } from '@angular/core';
import { Conference } from '../conference';

@Component({
  selector: 'app-conference-details',
  imports: [],
  templateUrl: './conference-details.html',
  styleUrl: './conference-details.css',
})
export class ConferenceDetails {
  readonly conf = input<Conference | null>(null);
  readonly closed = output<void>();
}
