import { Component, output } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
export interface Conference { id:number; title:string; description:string; date:Date; place:string; maxParticipants:number; nbParticipants:number; speaker:string; category:string; }
@Component({ selector:'app-conference-list', imports:[DatePipe,UpperCasePipe], templateUrl:'./conference-list.html', styleUrl:'./conference-list.css' })
export class ConferenceList {
 readonly conferenceSelected = output<Conference>();
 protected readonly conferences:Conference[] = [
  { id:1,title:'Designing for a more human web',description:'Explore the small design decisions that make digital products feel more welcoming, useful, and accessible.',date:new Date(2026,9,18,9,30),place:'Auditorium Atlas',maxParticipants:120,nbParticipants:83,speaker:'Nadia Ben Salem',category:'Design & product' },
  { id:2,title:'The next chapter of artificial intelligence',description:'A practical look at the tools, questions, and opportunities shaping responsible AI in our everyday work.',date:new Date(2026,9,22,14),place:'Studio Carthage',maxParticipants:90,nbParticipants:84,speaker:'Youssef Trabelsi',category:'Technology' },
  { id:3,title:'Building teams that make a difference',description:'Learn how thoughtful collaboration can turn ambitious ideas into lasting impact.',date:new Date(2026,9,29,11),place:'Maison des Arts',maxParticipants:150,nbParticipants:150,speaker:'Amira Kallel',category:'Leadership' },
 ];
 protected readonly upcomingConferences = this.conferences.filter(c => c.date >= new Date(new Date().setHours(0,0,0,0)));
 protected select(conference:Conference):void { this.conferenceSelected.emit(conference); }
 protected seatsLeft(conference:Conference):number { return conference.maxParticipants-conference.nbParticipants; }
}
