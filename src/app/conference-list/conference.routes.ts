import type { Routes } from '@angular/router';

export const CONFERENCE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./conference-list').then(module => module.ConferenceList),
  },
  {
    path: 'new',
    loadComponent: () => import('../conference-form/conference-editor').then(module => module.ConferenceEditor),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('../conference-form/conference-editor').then(module => module.ConferenceEditor),
  },
  {
    path: ':id',
    loadComponent: () => import('../conference-page/conference-page').then(module => module.ConferencePage),
  },
];
