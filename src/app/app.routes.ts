import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(module => module.Home),
  },
  {
    path: 'list',
    loadChildren: () => import('./conference-list/conference.routes').then(module => module.CONFERENCE_ROUTES),
  },
  {
    path: 'registration',
    loadChildren: () => import('./registration/registration.routes').then(module => module.REGISTRATION_ROUTES),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact').then(module => module.Contact),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then(module => module.Profile),
  },
  {
    path: '**',
    loadComponent: () => import('./notfound/notfound').then(module => module.Notfound),
  },
];
