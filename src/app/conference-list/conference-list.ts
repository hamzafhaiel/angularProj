import { Component, signal } from '@angular/core';
import { ConferenceDetails } from '../conference-details/conference-details';
import { Conference } from '../conference';

@Component({
  selector: 'app-conference-list',
  imports: [ConferenceDetails],
  templateUrl: './conference-list.html',
  styleUrl: './conference-list.css',
})
export class ConferenceList {
  readonly selectedConference = signal<Conference | null>(null);
  conferences :Conference[]=[
    {id:1,name:"angular",date:"2023-01-01",place:"tunis"},
    {id:2,name:"react",date:"2023-02-01",place:"sfax"},
    {id:3,name:"vue",date:"2023-03-01",place:"sousse"},
  ]
  viewDetails(conference: Conference): void {
    this.selectedConference.set(conference);
  }
}
