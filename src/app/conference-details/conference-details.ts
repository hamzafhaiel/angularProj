import { Component, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Conference } from '../conference-list/conference-list';
@Component({ selector:'app-conference-details', imports:[DatePipe], templateUrl:'./conference-details.html', styleUrl:'./conference-details.css' })
export class ConferenceDetails {
 readonly conference = input<Conference | null>(null);
 protected readonly isRegistered = signal(false);
 protected register():void { this.isRegistered.set(true); }
}
