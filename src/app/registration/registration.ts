import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="registration-title">
      <h1 id="registration-title">Registration</h1>
      <p>Start by choosing a conference and reviewing its date and location.</p>
      <a routerLink="/list">Browse conferences</a>
    </section>
  `,
})
export class Registration {}
