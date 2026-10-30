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
| src | string (URL) | yes | a webm or mp4 file, or the page of a YouTube or Vimeo video (shown through the provider's player, loaded only when a visitor presses play) |
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
| isActive | boolean | yes | a switched-off account cannot sign in and its token stops working at once |
| createdAt | date | yes | assigned by the backend (API only) |

The password (hashed with bcrypt) is sent only on sign-in and never returned.

## Library
A library in Montenegro shown on the interactive map. Code: `frontend/src/features/libraries/`, `backend/app/libraries/`. Everyone reads the list; only an admin adds, edits or deletes (Administration -> Libraries on the map).

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

## Collection
A collection of the library's digital library, shown on the Collections page and linked to dlib.me. Code: `frontend/src/features/collections/`, `backend/app/collections/`. Everyone reads; only an admin writes.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| name | Localized | yes | both languages |
| text | Localized | yes | both languages |
| href | string (URL) | yes | link to the collection in dlib.me |
| image | string (URL) | yes | a link, or `/media/...` from the media library |
| position | number | yes | 0-10000; collections are shown by position, then by id |

## ContentBlock
A site text an admin has edited (CMS). Code: `frontend/src/features/content/`, `backend/app/content/`. The default texts live in the frontend
(`messages-me.ts`, `messages-en.ts`); a block with the same `key` replaces the default, and deleting the block brings it back. The keys offered for editing (62) are listed in
`frontend/src/features/content/editable-keys.ts`; the API itself accepts any valid key.

| Field | Type | Required | Notes |
|---|---|---|---|
| key | string | yes | the message key, e.g. `about.lead`: lowercase words and digits separated by dots, at most 80 characters; unique |
| value | Localized | yes | both languages, 1-20000 characters each |
| updatedAt | date | yes | assigned by the backend |

## MediaAsset
A picture or video in the media library. Code: `frontend/src/features/media/`, `backend/app/media/`. The file itself is stored on the server (`MEDIA_DIR`)
under a random name and served publicly at `url`; the record keeps the author and licence the site must show.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| url | string | yes | `/media/<random>.<ext>`, public, no token needed |
| filename | string | yes | the name of the uploaded file, only shown |
| contentType | `image/jpeg` \| `image/png` \| `image/webp` \| `image/gif` \| `video/mp4` \| `video/webm` | yes | decided by the server from the file's content |
| size | number | yes | bytes, at most `MAX_UPLOAD_MB` (50 by default) |
| credit | string | yes | author or source, 1-200 characters |
| license | string | yes | e.g. "CC BY-SA 4.0", 1-100 characters |
| sourceUrl | string (URL) | no | the page of the original |
| uploadedById | number | no | the user who uploaded it; assigned by the backend |
| createdAt | date | yes | assigned by the backend |

The editor stores the chosen picture in the object (`imageUrl`, `rights` = "licence · credit", `sourceUrl`), not a reference to the asset, so an
exhibition keeps working if the library is rearranged; deleting a file leaves a missing picture in exhibitions that use it.

## AuditEntry
One change made by a signed-in user, kept so an admin can see who changed what and when. Code: `frontend/src/features/audit/`, `backend/app/audit/`. Entries are written by the backend in the same transaction as the change (a refused or failed change leaves none); there is no way to edit or delete one. Only admins read them.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | yes | |
| createdAt | date | yes | assigned by the backend |
| actorId | number | no | the user who made the change; missing if the account was later removed |
| actorName | string | yes | copied at the time, so the entry stays readable |
| action | `create` \| `update` \| `delete` | yes | |
| entityType | `exhibition` \| `content` \| `library` \| `collection` \| `user` \| `media` | yes | |
| entityRef | string | yes | the record's id, or the message key for site texts |
| label | string | yes | what it was called then (exhibition title, library name, account name and email, text key, file name), at most 200 characters |
| detail | string | no | codes separated by ", " that the frontend translates: `status=draft>pending`, `status=draft`, `role=curator>admin`, `role=curator`, `switched_on`, `switched_off`, `new_password`, `default_restored`, `type=image/png`, `size=1200`, or the names of the changed fields |

Never stored: passwords, file contents, or the full text of an edit.

## Favorite
Saved exhibitions of a visitor. Visitors have no account, so favorites live only in the visitor's browser (`localStorage`, `frontend/src/features/favorites/`). The backend does not store them.

## Access rules
- Anyone reads **published** exhibitions.
- Visitor (no account): reads published exhibitions, libraries, collections and videos.
- Curator: creates exhibitions; edits and deletes only their own; can submit a draft (`pending`).
- Admin: edits any exhibition, publishes or returns `pending` exhibitions to `draft`, creates and manages staff accounts (role, on/off, new password).

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
| 403 | not the author or an admin / not an admin / status change not allowed | `not_exhibition_author` / `admin_only` / `status_change_not_allowed` (with `fieldErrors.status`) / `cannot_change_own_access` / `account_disabled` |
| 404 | no such exhibition, or a draft or pending one the caller may not see / no such edited text | `exhibition_not_found` / `content_block_not_found` |
| 409 | the address (slug) could not be made unique / two admins saved a new text at once | `slug_taken` / `content_conflict` / `email_already_registered` |
| 422 | invalid input | `validation_error`, with `fieldErrors` |

### Auth and users
| Route | Auth | Body | Response |
|---|---|---|---|
| `POST /api/auth/sign-in` | no | `{ email, password }` | `200 { token, user }`, `401` |
| `GET /api/auth/me` | yes | | `200` user |
| `GET /api/users?page=&size=` | admin | | `200` page of users, `403` for a curator |
| `POST /api/users` | admin | `{ email, name (1-80), role, password (8-72) }` | `201` user, `403` `admin_only`, `409` `email_already_registered` (with `fieldErrors.email`), `422` |
| `PATCH /api/users/:id` | admin | any subset of `{ name, role, isActive, password }` | `200` user, `403` `admin_only` / `cannot_change_own_access`, `404` `user_not_found`, `422` |

There is no sign-out call (the client drops the token) and no public registration: an admin creates staff accounts (Administration -> Users),
chooses the role and a first password and hands both to the person. `poetry run seed` creates the three demo accounts, password `demo1234`.
User: `{ id, name, email, role, isActive, createdAt }`. An admin cannot change their own role or switch themselves off. A switched-off account
gets `403 account_disabled` on sign-in (after the right password) and `401 invalid_token` on any call with an older token.

### History of changes
| Route | Auth | Query | Response |
|---|---|---|---|
| `GET /api/audit?entityType=&page=&size=` | admin | `entityType` is one of the six kinds | `200` page of entries, newest first; `401`, `403` `admin_only`, `422` for an unknown kind |

Recorded: creating, changing and deleting exhibitions (including every status move), site texts (and restoring the default), libraries, collections, accounts (role, on/off, new password; never the password itself) and uploaded files.

### Pages for search engines and link previews
Not under `/api`: public pages at the site's own addresses. The reverse proxy sends `/exhibitions/*`, `/sitemap.xml` and `/robots.txt` to the backend (everything else to the built frontend).

| Route | Response |
|---|---|
| `GET /exhibitions/:slug` | the built `index.html` with the exhibition's title, description, picture, canonical address and schema.org data in the head, so Facebook, Viber, LinkedIn and search engines see them without running JavaScript; `404` for an unknown or unpublished exhibition, or when the frontend is not built |
| `GET /sitemap.xml` | the public pages and every published exhibition |
| `GET /robots.txt` | allows everything except `/admin`, `/studio`, `/profile`, `/sign-in`; points to the sitemap |

Settings: `PUBLIC_BASE_URL` (the address the site is reached at, used in links) and `FRONTEND_DIST_DIR` (folder with the built frontend).

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

### Site content (CMS)
| Route | Auth | Body | Response |
|---|---|---|---|
| `GET /api/content?page=&size=` | no | | `200` page of blocks (the frontend applies them over its default texts) |
| `PUT /api/content/:key` | admin | `{ value: { me, en } }` | `200` block (created or replaced), `403` `admin_only`, `422` bad key or an empty language |
| `DELETE /api/content/:key` | admin | | `204`, `404` `content_block_not_found` when the text was never edited |

### Media library
| Route | Auth | Body | Response |
|---|---|---|---|
| `GET /api/media?page=&size=` | yes | | `200` page of assets: a curator sees their own, an admin all |
| `POST /api/media` | yes | multipart form: `file`, `credit`, `license`, `sourceUrl?` | `201` asset, `400` `unsupported_media_type` or `file_too_large` (with `fieldErrors.file`), `422` |
| `DELETE /api/media/:id` | uploader, admin | | `204`, `403` `not_media_owner`, `404` `media_not_found` |
| `GET /media/:storedName` | no | | the file (not under `/api`) |

Only JPEG, PNG, WebP and GIF pictures and MP4 and WebM videos are accepted; SVG and anything else is refused.

### Libraries on the map
| Route | Auth | Body | Response |
|---|---|---|---|
| `GET /api/libraries?type=&city=&page=&size=` | no | | `200` page by name; `type` is one of the four types, `city` matches exactly, ignoring case |
| `GET /api/libraries/:id` | no | | `200`, `404` `library_not_found` |
| `POST /api/libraries` | admin | `{ name, type, city, address?, website?, email?, phone?, description?, image?, location? }` | `201`, `403` `admin_only`, `422` |
| `PATCH /api/libraries/:id` | admin | any subset; an explicit `null` clears an optional field (not `name`, `type`, `city`) | `200`, `403`, `404`, `422` |
| `DELETE /api/libraries/:id` | admin | | `204`, `403`, `404` |

`location` is `{ lat (-90..90), lng (-180..180), precision }` as a whole or missing; the database holds the three values as one all-or-nothing group.
`image` is `{ url, credit, license, sourceUrl }`, all four required together. `description` needs both languages.

### Collections
| Route | Auth | Body | Response |
|---|---|---|---|
| `GET /api/collections?page=&size=` | no | | `200` page, by `position` |
| `POST /api/collections` | admin | `{ name, text, href, image, position? }` | `201`, `403`, `422` |
| `PATCH /api/collections/:id` | admin | any subset | `200`, `403`, `404` `collection_not_found` |
| `DELETE /api/collections/:id` | admin | | `204`, `403`, `404` |

Everything the frontend shows now comes from the API when it runs with `pnpm dev:api`; what is left in the frontend code is only the sample data of the mock (`pnpm dev`) and the seed of the backend.
