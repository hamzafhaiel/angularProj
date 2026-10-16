import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="contact-title">
      <h1 id="contact-title">Contact</h1>
      <p>For questions about an event, check its conference details for the date and location.</p>
      <a routerLink="/list">Find a conference</a>
    </section>
  `,
})
export class Contact {}
