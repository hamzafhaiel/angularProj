# AngularProj - Conference Navigation

An Angular 21 learning project implementing Prosits 1-4: structured navigation,
dynamic conference routes, registration confirmation, and lazy loading.
Built with standalone components, TypeScript, Angular Signals, and RxJS.

## Features

- Home page with interpolation, event binding, two-way binding, signals, and native control flow examples.
- Responsive conference cards with **View details** links and direct URLs for each conference.
- Navigation menu with `routerLinkActive` highlighting and accessible active-page indicators.
- Registration selection and automatic navigation to a conference-specific confirmation page.
- Registration status stored in `sessionStorage` and restored after refreshing in the same browser session.
- Handling for unknown URLs, invalid conference IDs, missing registrations, and storage failures.
- Lazy-loaded pages and feature route groups, with browser back/forward navigation preserved.

Registration is a local demonstration: it does not reserve a place on a server or
create a user account. Contact and User profile are basic navigation pages;
authentication, contact submission, payments, and administration are not implemented.
Conference data is sample data defined in `src/app/conferences.ts`.

## Getting started

Install Node.js compatible with Angular 21 and npm, then run:

```bash
npm ci
npm start
```

Open [http://localhost:4200/](http://localhost:4200/).
The development server reloads the application when source files change.

## Routes

| URL | Page or behavior |
| --- | --- |
| `/` | Redirect to `/home` |
| `/home` | Home and Angular examples |
| `/list` | Conference list |
| `/list/:id` | Conference details |
| `/registration` | Choose a conference to register for |
| `/registration/:id` | Confirm registration for the selected conference |
| `/registration/:id/confirmation` | Show confirmation if a registration exists |
| `/contact` | Contact page |
| `/profile` | Guest user profile |
| Any unmatched URL | Not-found page |

For example, open `/list/2`, select **Register for this conference**, and then
**Confirm registration**. The app saves the registration in the browser session
and navigates to `/registration/2/confirmation`. Opening a confirmation URL
without registering displays **No registration found**.

## Architecture

```text
src/app/
  app.routes.ts                   # Root routes and lazy-loading entry points
  app.config.ts                   # Application and router providers
  header/                         # Navigation and active-link styles
  footer/                         # Shared footer
  home/                           # Angular binding and signal examples
  conference.ts                   # Conference interface
  conferences.ts                  # Shared sample conference data
  conference-list/
    conference.routes.ts          # Lazy child routes: list and detail
  conference-page/                # Reads the route ID and selects a conference
  conference-details/             # Displays the conference received through input()
  registration/
    registration.routes.ts        # Lazy child routes: selection and confirmation
    registration.ts               # Registration page and Router.navigate()
    registration-confirmation.ts  # Confirmation and registration-state checks
    registration-store.ts         # Signal-based session storage
  contact/
  profile/
  notfound/
```

`App` keeps the header and footer around one `router-outlet`. Simple pages use
`loadComponent`; conference and registration features use `loadChildren` with
their own route configuration files. Feature pages are downloaded on demand,
without automatic background preloading.

Dynamic pages read `ActivatedRoute.paramMap` through `toSignal()` so changing
the URL ID updates the selected conference without manual parameter subscriptions.
The detail component receives its data through `input()`.

## Build and tests

```bash
# Optimized production build
npm run build

# Run the Vitest suite once
npm test -- --watch=false

# Watch tests during development
npm test
```

Production browser files are generated in `dist/anguproject/browser/`.
The latest verified suite contains **37 passing tests** covering route access,
active links, parameter changes, browser history, registration, session recovery,
error handling, and lazy loading. No separate browser end-to-end suite is configured.

The lazy-loading production build reduced the initial JavaScript from about
265 kB to 234 kB (raw bundle size); individual pages appear as separate lazy chunks.

## Deployment

Serve the production browser directory with an SPA fallback: application URLs
such as `/list/2` must return `index.html` so direct links and refreshes work.
Keep the generated JavaScript chunks available alongside the application.
Images on the home, conference, and not-found pages use external URLs.

## Prosit notes

- [Prosit 1 - Why navigation is needed](docs/prosit1-navigation.md)
- [Prosit 2 - Page organization and active navigation](docs/prosit2-navigation.md)
- [Prosit 3 - Dynamic navigation and registration confirmation](docs/prosit3-navigation.md)
- [Prosit 4 - Child routes and lazy loading](docs/prosit4-lazy-loading.md)
