import type { Routes } from '@angular/router';

export const REGISTRATION_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./registration').then(module => module.Registration),
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./registration').then(module => module.Registration),
      },
      {
        path: 'confirmation',
        loadComponent: () => import('./registration-confirmation').then(module => module.RegistrationConfirmation),
      },
    ],
  },
];
