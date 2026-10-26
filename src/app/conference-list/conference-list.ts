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
  readonly store = inject(ConferenceStore);
  readonly conferences = this.store.conferences;

  async remove(id: number): Promise<void> {
    try { await this.store.remove(id); } catch { /* The store exposes the error to the view. */ }
  }
}
