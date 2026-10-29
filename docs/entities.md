# Entities and API contract

Shared by frontend and backend. Types live in `frontend/src/features/<name>/types.ts`; mock APIs in each feature's `api/` folder
(`*-mock.ts`), calls to the real backend in `*-http.ts`. The backend (`backend/`) answers exactly what is written here;
a change to the contract is made in this file, the backend and the frontend in the same commit.
`Localized` means `{ "me": string, "en": string }` (Montenegrin Latin script and English).

## Exhibition
Code: `frontend/src/features/exhibitions/`

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | assigned by backend |
| slug | string | yes | unique, URL-safe, generated from the title |
| title | Localized | yes | 3+ characters per language |
| summary | Localized | yes | 10+ characters per language |
| intro | Localized | no | curator's introduction shown above the viewer |
| coverUrl | string (URL) | yes | |
| template | `timeline` \| `gallery` \| `map` \| `slider` \| `room` \| `book` \| `carousel` | yes | selects the viewer |
| status | `draft` \| `pending` \| `published` | yes | draft -> pending (curator submits) -> published (admin) |
| period | string | yes | free text, e.g. "1494 – 1873" |
| tags | string[] | no | |
| authorId | number | yes | User.id of the curator |
| authorName | string | yes | denormalized for display |
| sections | Section[] | yes | ordered, at least 1 |
| videos | ExhibitionVideo[] | no | shown under the viewer and in the video gallery |
| createdAt | date | yes | assigned by backend |

Relations: belongs to one User (author); has many Sections (embedded, ordered).

## Section
Embedded in Exhibition (own table in the database).

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| title | Localized | yes | |
| text | Localized | yes | |
| year | number | no | 1000–2100, used by timeline and slider |
| place | `{ name: Localized, lat: number, lng: number }` | no | required for the `map` template |
| items | ExhibitionItem[] | yes | slider uses 2 items as before/after |

## ExhibitionItem
A digitized object (book, manuscript, map, photo...) from the library collections, linked to dlib.me.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| type | `book` \| `manuscript` \| `map` \| `photo` \| `periodical` \| `poster` \| `audio` | yes | |
| title | Localized | yes | |
| creator | string | yes | |
| year | number | no | unknown for some historical objects |
| collection | string | yes | e.g. "Kartografska zbirka" |
| imageUrl | string (URL) | yes | |
| sourceUrl | string (URL) | yes | link to the object in dlib.me |
| rights | string | yes | |
| signature | string | no | shelf mark in the library |
| inventoryNo | string | no | inventory number |
| language | string | no | language and script of the object |
| material | string | no | e.g. "paper, print" |
| dimensions | string | no | e.g. "21 x 15 cm" |

Relations: belongs to one Section (later: many-to-many, so one object can appear in several exhibitions).

## ExhibitionVideo
Embedded in Exhibition (own table in the database). Files are served by the backend or a CDN.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| title | Localized | yes | |
| description | Localized | yes | |
| src | string (URL) | yes | webm or mp4 |
| credit | string | yes | author or source |
| license | string | yes | e.g. CC BY-SA 4.0 |
| sourceUrl | string (URL) | yes | page of the original file |

## User
Code: `frontend/src/features/auth/`, `backend/app/users/` and `backend/app/auth/`

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| name | string | yes | 1-80 characters |
| email | string | yes | unique, stored lowercase |
| role | `curator` \| `admin` | yes | visitors have no account |
| createdAt | date | yes | assigned by the backend (API only) |

The password (hashed with bcrypt) is sent only on sign-in and never returned.

## Library
A library in Montenegro shown on the interactive map (`frontend/src/features/libraries/`). Read-only for visitors; the backend may later let an admin edit the list.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| name | string | yes | proper noun, not translated |
| type | `national` | `university` | `public` | `special` | yes | |
| city | string | yes | |
| address | string | no | only where an official source states it |
| website | string (URL) | no | |
| email | string | no | |
| phone | string | no | |
| description | Localized | no | short facts, only where a source states them |
| image | `{ url, credit, license, sourceUrl }` | no | free photo of the building; the credit must be shown |
| location | `{ lat: number, lng: number, precision: 'exact' \| 'town' }` | no | `town` = centre of the town (approximate); missing = no pin on the map |

Source of the sample data: names from the COBISS.CG statistics for 2025 (full members), coordinates from OpenStreetMap (ODbL).

## Favorite
Saved exhibitions of a visitor. Visitors have no account, so favorites live only in the visitor's browser (`localStorage`, `frontend/src/features/favorites/`). The backend does not store them.

## Access rules
- Anyone reads **published** exhibitions.
- Visitor (no account): reads published exhibitions, libraries, collections and videos.
- Curator: creates exhibitions; edits and deletes only their own; can submit a draft (`pending`).
- Admin: edits any exhibition, publishes or returns `pending` exhibitions to `draft`, lists users.

## API

Implemented by the backend in `backend/app/` (code of each route: `backend/app/<domain>/api/`). Interactive docs at
http://localhost:8000/docs while the backend runs. The frontend uses it with `pnpm dev:api`
(`frontend/src/features/<name>/api/<name>-http.ts`); `pnpm dev` uses the in-browser mock instead.

### Conventions
- Base path `/api`. JSON keys are camelCase in requests and responses. Ids are integers assigned by the backend.
- Dates are ISO 8601 in UTC (`2026-10-12T09:30:00Z`). The frontend only shows the year.
- Protected routes take `Authorization: Bearer <token>`; the token comes from `POST /api/auth/sign-in` and lasts 60 minutes.
- `POST` answers `201` with the created record, `DELETE` answers `204` with no body.
- `GET` lists are paginated: `?page=1&size=50` (size at most 500) and answer `{ "total", "items", "pages" }`, newest first.
- Optional fields without a value come as `null` (the frontend turns them into "missing").
- Every error has one shape: `{ "detail": "...", "code": "snake_case_code" }`, plus `"fieldErrors": { "field": "message" }` when a field is at fault.
  `401` answers also carry `WWW-Authenticate: Bearer`.

| Status | When | `code` |
|---|---|---|
| 401 | no token / bad or expired token / wrong e-mail or password | `not_authenticated` / `invalid_token` / `invalid_credentials` |
| 403 | not the author or an admin / not an admin / status change not allowed | `not_exhibition_author` / `admin_only` / `status_change_not_allowed` (with `fieldErrors.status`) |
| 404 | no such exhibition, or a draft or pending one the caller may not see | `exhibition_not_found` |
| 409 | the address (slug) could not be made unique | `slug_taken` |
| 422 | invalid input | `validation_error`, with `fieldErrors` |

### Auth and users
| Route | Auth | Body | Response |
|---|---|---|---|
| `POST /api/auth/sign-in` | no | `{ email, password }` | `200 { token, user }`, `401` |
| `GET /api/auth/me` | yes | | `200` user |
| `GET /api/users?page=&size=` | admin | | `200` page of users, `403` for a curator |

There is no sign-out call (the client drops the token) and no registration: staff accounts are created by an admin in the database
(`poetry run seed` creates the three demo accounts, password `demo1234`). User: `{ id, name, email, role, createdAt }`.

### Exhibitions
Create and PATCH bodies have the fields of **Exhibition** above except `id`, `slug`, `authorId`, `authorName`, `createdAt`; sections have no `id`.
Limits: `period` 2-60 characters, at most 20 tags, 1-100 sections, section `year` 1000-2100, item `year` 1-2100; every `Localized` value needs both languages.
`PATCH` changes only the fields that are sent; `sections` and `videos` replace the whole list (their ids change).

| Route | Auth | Notes |
|---|---|---|
| `GET /api/exhibitions?search=&template=&status=&authorId=&ids=1,2` | optional | anonymous: published only; curator: published plus own; admin: all. `search` matches title, summary and tags |
| `GET /api/exhibitions/:slugOrId` | optional | `404` for what the caller may not see |
| `POST /api/exhibitions` | curator, admin | the author is the signed-in user; a curator can create `draft` or `pending`, an admin any status |
| `PATCH /api/exhibitions/:id` | author, admin | a `status` in the body follows the rules below |
| `PATCH /api/exhibitions/:id/status` | author, admin | body `{ status }` |
| `DELETE /api/exhibitions/:id` | author, admin | |

Status rules: an author moves an exhibition between `draft` and `pending` and cannot change a published one's status; an admin sets any status.
Sending the current status again is always allowed (the editor does it when an author edits a published exhibition).

### Not in the API yet
Libraries (`GET /libraries`), collections and the About texts are still data in the frontend; they move to the backend together with
the CMS part (editable site content), see `backend/README.md`.
