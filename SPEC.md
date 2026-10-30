# Spec: Virtual Exhibitions of the National Library of Montenegro

Design lives in [`frontend/DESIGN.md`](frontend/DESIGN.md), data and API in [`docs/entities.md`](docs/entities.md), agent rules in [`CLAUDE.md`](CLAUDE.md), the plan and milestones in [`PLAN.md`](PLAN.md).

## Goal

A web platform where library curators turn digitized material (books, manuscripts, maps, photographs, periodicals, video) into interactive exhibitions, and visitors (students, researchers, teachers, culture enthusiasts, mostly on phones) explore them in Montenegrin or English.

## MVP

One flow that works end to end on mock data: **find an exhibition, open it, read it in its template, save it**. Alongside it, the curator flow: **sign in, create an exhibition, submit it, an admin publishes it**.

Must hold everywhere: loading, empty and error states for every list; usable at 375 px and 1440 px; no hardcoded UI text (every string exists in Montenegrin and English).

## Roles

| Role | Can |
|---|---|
| Visitor (no account, not signed in) | read published exhibitions, search and filter, watch videos, save favorites |
| Curator | everything a visitor can, plus create exhibitions, edit and delete **own** exhibitions, submit a draft for publishing |
| Admin | everything a curator can, plus edit any exhibition, publish or return pending exhibitions to draft, list users |

Exhibition status flow: `draft` -> `pending` (curator submits) -> `published` (admin).

## Screens

| Route | Screen | Done when |
|---|---|---|
| `/` | Home | hero, stats, featured exhibition, latest, templates, videos and collections show real data; stats show a dash while loading |
| `/exhibitions` | Catalog | search and template filter work and stay in the URL; empty result offers a reset; error offers a retry |
| `/exhibitions/:slug` | Exhibition viewer | the template renders the sections; items open a detail dialog with author, year, collection, rights and a source link; videos play; unknown slug shows a not-found message |
| `/collections` | Collections | the eight collections of the digital library link out; exhibitions from them are listed |
| `/map` | Interactive map | libraries of Montenegro (photo pins where a free photo exists) and places from exhibitions as two layers; search ignoring diacritics and a type filter work; a detail card shows the photo with credit, facts, contact and links; "nearest library" asks for the location only on click and stores nothing; every place links to its exhibition; approximate locations are marked and the sources are named |
| `/videos` | Video gallery | all videos of published exhibitions play and link back to their exhibition |
| `/about` | About | mission, how an exhibition is made, platform numbers, contact and sources |
| `/favorites` | Saved | lists saved exhibitions; empty state explains how to save |
| `/sign-in` | Sign in | email and password validated; wrong credentials show an error; demo accounts can be filled in with one click; after success the user lands on the page for their role (curator: Studio, admin: Administration) with a greeting |
| `/profile` | Profile | signed-in users see name, email, role with a short description, and their saved exhibitions |
| `/studio` | Curator dashboard | lists own exhibitions with status; submit, edit, delete; empty state |
| `/studio/new`, `/studio/:id/edit` | Editor | bilingual fields validated with Zod; sections can be added and removed; saved as draft or submitted; only the author or an admin can edit |
| `/admin` | Admin | review queue (publish or return to draft) and users list |
| `*` | Not found | explains and links home |

## Exhibition templates

| Template | What the visitor gets |
|---|---|
| Timeline | scroll-driven chapters with media that follows the text |
| Gallery | masonry grid, lightbox with metadata and keyboard navigation |
| Map story | numbered stops on a map with a route line and a chapter list |
| Slider | horizontal slides with a before/after comparison handle |
| 3D hall | a virtual room with framed objects; drag to look around, click a frame for details |
| Page-turning book | a cover, one spread per section (picture left, text right) and a credits page; a sheet turns in 3D on wide screens, one page at a time on phones; arrow keys work |
| Card catalogue | objects as index cards in a library drawer, one group per section; select a card to pull it out and see every catalogue detail, click the picture to enlarge |
| 3D carousel | objects in a ring that turns by itself (pause button, stops on hover and focus, off with reduced motion); drag, arrows or click a neighbour to turn; click the front one for details |

## Backend

The API in `backend/` (FastAPI, SQLite or Postgres) implements the contract in `docs/entities.md`: staff sign-in with a token, exhibitions with sections, objects and videos, the draft -> pending -> published flow and the access rules, enforced on the server. `pnpm dev` runs the frontend on mock data, `pnpm dev:api` on the API.

## Libraries on the map and collections

An admin opens Administration and chooses "Libraries on the map" or "Collections". Each is a list with Add, Edit and Delete (with a confirmation). A library has a name, type, town, optional address, website, e-mail, phone, a short description in both languages, a free photo with its author, licence and source page, and a pin (latitude, longitude and whether it is exact or the centre of the town; the position is set by clicking on a small map in the form, or by typing the coordinates, and the pin follows both); the optional groups are saved whole or not at all, and a library without a pin is listed but not drawn. A collection has a name and text in both languages, a link to the digital library, a picture and a position that sets the order. On the Map page an admin also sees "Add a library" and, for the selected library, "Edit". Everyone sees the changes at once. With `pnpm dev` they live in memory; with `pnpm dev:api` they are stored in the database, seeded with the same data.

## Media library

A curator opens Studio -> Media library (`/studio/media`) and uploads a picture or video with the author and the licence (and optionally the source page); an admin sees all files, a curator their own, and each can delete their file. In the exhibition editor every section has a picker for the picture of its object: choose a file from the library or upload one on the spot, and the picture, its author and licence travel with the object (and the first one becomes the cover). The server accepts only JPEG, PNG, WebP, GIF, MP4 and WebM, decided from the content of the file, up to 50 MB. With `pnpm dev` files live in memory until the page is reloaded; with `pnpm dev:api` they are stored on the server and served at `/media/...`.

## Site content (CMS)

An admin opens Administration -> Edit site content (`/admin/content`) and edits 62 site texts in both languages, in seven groups with a search: Home, Collections/Video/Map, About, the descriptions of the eight viewing modes, hints and notices (including the citation format), staff sign-in and the footer. Labels of buttons and menus, and the texts of the exhibition editor and the assistant, are not offered. A text that contains marks like `{title}` can be edited only while the marks stay in both languages. A saved text replaces the default for every visitor (kept in the database with `pnpm dev:api`, in memory with `pnpm dev`); "Restore default" deletes it. Both languages are required.

## Exhibition page

Every exhibition page has, above the viewer: the curator's introduction (or the summary), a facts panel (curator, period, collections, objects, year), a ready-made citation with a copy button, a "view as" switch (any viewer can show any exhibition; the map only when every section has a place), full screen and a "Download catalogue (PDF)" button that prints a clean catalogue page. Related exhibitions follow the viewer. The object dialog zooms (wheel, buttons, `+` / `-` keys, double click), shows optional shelf mark, inventory number, language, material and dimensions, and offers a download only for public-domain or CC material.

Viewer extras: timeline year ruler, gallery filters and sorting, map popups with a picture, 3D hall loading bar and object list, book contents, carousel thumbnail strip.

## App-wide rules

- Montenegrin (Latin script, never Cyrillic) and English for all UI text; content fields are `{ me, en }`.
- Accessible: semantic HTML, every image has `alt`, every input has a label, visible focus, text contrast of at least 4.5:1, reduced motion respected.
- Colors, fonts and radius only from the tokens in `frontend/src/index.css`.
- Images and videos are freely licensed (Wikimedia Commons); the author and licence are shown with each object.

## Demo assistant and editor check

Both are simulations that call no AI service and send no data anywhere.

- **Assistant** (button on every page): answers from the content of the site (exhibitions, objects, libraries, collections) and from ready-made guides, in the current language; it says it is a demo. Replace its `api/` layer with a real model after the backend exists.
- **Exhibition check** (editor): a rule-based checklist and tag suggestions that update while the curator types.

## Later (not in the MVP)

- Real backend, database and authentication (Workshop 4).
- Reordering sections by drag and drop; several objects per section in the editor; live preview.
- User management by admins (create accounts, change roles); editing the About and Collections pages from the app.
- Search inside exhibition texts; sharing and QR codes.
- A real AI assistant (grounded in the exhibition texts), translation and image-description help for curators, virtual tours from 360° photographs.

## Out of scope

Payments, comments from visitors, real-time collaboration, and offline use.

## Open questions

- Which digitized objects and metadata fields will the library provide, and in which formats (images, IIIF, audio)?
- Who may publish: any admin, or a separate editor role?
- Decided: visitors have no accounts. Favorites stay in the browser; only curators and admins sign in.
