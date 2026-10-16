import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="profile-title">
      <h1 id="profile-title">User profile</h1>
      <p>You are browsing as a guest.</p>
      <a routerLink="/registration">Explore conference registration</a>
    </section>
  `,
})
export class Profile {}
