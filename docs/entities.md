# Entities and API contract

Shared by frontend and backend. Types live in `frontend/src/features/<name>/types.ts`; mock APIs in each feature's `api/` folder.
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
Code: `frontend/src/features/auth/`

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| name | string | yes | |
| email | string | yes | unique |
| role | `curator` \| `admin` | yes | visitors have no account |

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

## API the frontend expects
- `GET /exhibitions?search=&template=&status=&authorId=` (anonymous sees only `published`)
- `GET /exhibitions/:slugOrId`
- `POST /exhibitions` (curator, admin)
- `PATCH /exhibitions/:id` (author or admin); `PATCH /exhibitions/:id/status` (admin publishes; author may set `pending`)
- `DELETE /exhibitions/:id` (author or admin)
- `POST /auth/sign-in`, `POST /auth/sign-out`, `GET /auth/me`
- `GET /users` (admin)
- `GET /libraries?type=&city=`, `GET /libraries/:id` (anonymous)
