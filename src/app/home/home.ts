import { Component, signal } from '@angular/core';
import { ConferenceList, type Conference } from '../conference-list/conference-list';
import { ConferenceDetails } from '../conference-details/conference-details';
@Component({ selector:'app-home', imports:[ConferenceList,ConferenceDetails], templateUrl:'./home.html', styleUrl:'./home.css' })
export class Home {
 protected readonly selectedConference = signal<Conference | null>(null);
 protected selectConference(conference:Conference):void { this.selectedConference.set(conference); }
}
