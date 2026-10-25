# AngularProj - Conferences, Navigation and Reactive Forms

An Angular 21 learning project implementing the four navigation prosits and
the three Reactive Forms prosits: structured routing, dynamic conference pages,
registration confirmation, lazy loading, and reusable validated add/edit forms.
Built with standalone components, TypeScript, Angular Signals, and RxJS.

## Features

- Home page with interpolation, event binding, two-way binding, signals, and native control flow examples.
- Responsive conference cards with **View details** links and direct URLs for each conference.
- An **Add conference** page and prefilled **Edit conference** page using the same Reactive Forms component.
- Typed `FormControl`/`FormGroup` models, field error messages, date validation, and participant capacity checks.
- Live title/description counters, form validity, and available places derived with `toSignal()` and `computed()`.
- A save button enabled only when valid, reset controls, and protection against duplicate submissions.
- Navigation menu with `routerLinkActive` highlighting and accessible active-page indicators.
- Registration selection and automatic navigation to a conference-specific confirmation page.
- Registration status stored in `sessionStorage` and restored after refreshing in the same browser session.
- Handling for unknown URLs, invalid conference IDs, missing registrations, and storage failures.
- Lazy-loaded pages and feature route groups, with browser back/forward navigation preserved.

Registration is a local demonstration: it does not reserve a place on a server or
create a user account. Contact and User profile are basic navigation pages;
authentication, contact submission, payments, and administration are not implemented.
Initial conference data is defined in `src/app/conferences.ts`. Added and edited
conferences are shared through `ConferenceStore` and persisted in `sessionStorage`
under `angularProj.conferences`. They appear in the list, details, and registration
pages and survive a refresh in the same browser session. This is local storage
for a demonstration, not a server database. Participant counts are editable
conference data; local demonstration registrations do not count server reservations.

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
| `/list/new` | Add a conference |
| `/list/:id/edit` | Edit a conference using a prefilled form |
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

To try the forms, open `/list/new`, enter valid values, and select **Save conference**.
The app opens the saved conference's details. Select **Edit conference** to update
the same ID, or **Reset** to restore the form's initial values.

## Conference form rules

The Reactive Forms implementation follows the supplied Course 3 examples:
`ReactiveFormsModule`, `FormControl`, `FormGroup`, `Validators`, `[formGroup]`,
`formControlName`, `(ngSubmit)`, and `getRawValue()`. `toSignal()` bridges
`valueChanges` and `statusChanges`; `computed()` derives values for the template.
The separate Signal Forms API is not used.

| Field | Validation |
| --- | --- |
| ID | Generated positive unique integer |
| Title | Required, 3-100 characters |
| Description | Required, 10-2000 characters |
| Category | Required, 2-50 characters |
| Place | Required, 2-120 characters |
| Date | Valid calendar date; today or later for a new or changed date |
| Maximum participants | Required integer from 1 to 100000 |
| Current participants | Required integer from 0 to the maximum participants |

Text consisting only of spaces is rejected; minimum lengths use trimmed text.
An edited historical conference may keep its original date. The group validator
enforces the relationship between current and maximum participants. Errors appear
after a field is touched or submission is attempted. A failed save retains entered
values, and both TypeScript submission code and the store validate data.
These length and capacity bounds are project choices where the assignments did
not prescribe exact limits.

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
  conference-data.ts              # Shared date and data validation
  conference-store.ts             # Signal-based add/edit data and session persistence
  conference-form/
    conference-form.ts            # Reusable typed Reactive Form and derived Signals
    conference-form.html          # Field bindings, errors, counters, and save/reset controls
    conference-validators.ts      # Text, date, integer, and cross-field validators
    conference-editor.ts          # Add/edit route page and save navigation
  conference-list/
    conference.routes.ts          # Lazy child routes: list, add, edit, and detail
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
The latest verified suite contains **71 passing tests** covering route access,
active links, parameter changes, browser history, registration, session recovery,
error handling, lazy loading, form constraints, Signals, add/edit integration,
and duplicate-save protection. No automated browser end-to-end suite is configured;
creation and refresh persistence were also checked manually in the browser.

The forms remain lazy-loaded. The latest production build's initial JavaScript
is about 236 kB raw; the editor, Reactive Forms dependencies, and other pages are
split into deferred chunks.

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
- [Reactive Forms Prosits 1-3 - Requirements, course methods, and chosen validation rules](docs/reactive-forms-prosits.md)
