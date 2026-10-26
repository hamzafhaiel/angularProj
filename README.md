# AngularProj - Teacher Project with HttpClient

This application now uses the teacher's `4SSA5-main (1).zip` as its base.
The teacher's Home, conference cards, detail-page design, header, footer, naming,
and routes are retained. The missing HttpClient integration is added using
Course 6. The earlier extended application remains available in Git history
at commit `5fd430c`.

## What changed from the teacher ZIP

- `services/conferance.ts` now calls JSON Server instead of returning a static array.
- The teacher's model is typed as `{ id, name, date, place }`.
- `provideHttpClient(withFetch())` configures HTTP in `app.config.ts`.
- `getAll()` and `getById()` return typed Observables.
- The list consumes GET through `toSignal()` and shows loading, errors, Retry, and an empty state.
- Details keep `id = input.required<string>()` and `withComponentInputBinding()`.
- An ID change cancels the previous request and loads the new conference through `switchMap`.
- Detail fields are rendered only after a response, preventing undefined-value errors.
- Invalid IDs, HTTP 404, network failures, and server errors have readable messages.
- The course's POST, PUT, PATCH, and DELETE methods are exposed and tested in the service.
  The teacher's interface still has only the list and Details screens; no extra CRUD forms were added.

The former add/edit forms, registration pages, local store, and lazy feature
structure are not part of this teacher-based version. Historical coursework
notes under `docs/` describe earlier revisions; the current implementation is
explained in [Teacher base and HttpClient](docs/teacher-httpclient.md).

## Run locally

Install Node.js compatible with Angular 21 and npm, then install dependencies:

```bash
npm ci
```

Terminal 1 - start the backend:

```bash
npm run api
```

Terminal 2 - start Angular:

```bash
npm start
```

Open [http://localhost:4200/list](http://localhost:4200/list).
Do not open files from `src/app/` directly with `file://`; Angular templates
must be compiled and served by the Angular development server.

## Routes

| URL | Screen |
| --- | --- |
| `/` | Redirects to `/home` |
| `/home` | The teacher's data-binding and signal examples |
| `/list` | Conference cards and Details buttons |
| `/details/:id` | Selected conference, for example `/details/1` |
| Any other path | The teacher's not-found component |

## Backend

JSON Server is pinned to `0.17.4`, as in the course, for numeric IDs.
The endpoint is [http://localhost:3000/conferences](http://localhost:3000/conferences).
The base URL is configured in `src/environments/environment.ts`.

`db.seed.json` contains the teacher's three conferences. On first startup,
`preapi` creates `db.json` only if it does not already exist. The working database
is Git-ignored and survives API restarts. For this local transition, the previous
API database was backed up to `tmp/teacher-base-backup/db.previous.json` before
applying the teacher's data. Previous session-storage entries are not used.

If updating another existing checkout, back up an old `db.json` before replacing
it with `db.seed.json`: the teacher uses `name`, not the previous `title` schema.
JSON Server is a local teaching backend, not an authenticated production service.

| HTTP method | Service method | Endpoint |
| --- | --- | --- |
| GET | `getAll(place?)` | `/conferences`, optional `?place=Tunis` |
| GET | `getById(id)` | `/conferences/:id` |
| POST | `add(conference)` | `/conferences`, without a client-generated ID |
| PUT | `update(conference)` | `/conferences/:id`, complete object |
| PATCH | `patch(id, changes)` | `/conferences/:id`, changed fields only |
| DELETE | `delete(id)` | `/conferences/:id` |

Requests have a ten-second timeout. Network errors suggest starting the API;
a missing record is distinguished from an unavailable server. `toSignal()`
cleans up the subscription when the component is destroyed. Components do not
inject HttpClient directly; only the teacher's service knows the backend URL.

## Checks

```bash
npm run build
npm test -- --watch=false
npm run test:api
```

The Angular tests cover HTTP verbs, payloads, error statuses, loading/empty/retry
states, parameter-to-input binding, changed IDs, cancellation, Details navigation,
and the teacher's remaining components. The real API smoke test uses a temporary
database and never alters your local `db.json`.

Build output is in `dist/anguproject/browser/`. A deployed SPA needs an
`index.html` fallback for direct application URLs and a separately configured
backend; `localhost:3000` is only the local development API.
