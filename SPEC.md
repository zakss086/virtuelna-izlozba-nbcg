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
| Visitor (not signed in or `visitor`) | read published exhibitions, search and filter, watch videos, save favorites |
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
| `/libraries` | Libraries map | libraries of Montenegro shown as pins on a map and as a list; search (ignores diacritics) and type filter work; approximate locations are marked; the sources are named |
| `/videos` | Video gallery | all videos of published exhibitions play and link back to their exhibition |
| `/about` | About | mission, how an exhibition is made, platform numbers, contact and sources |
| `/favorites` | Saved | lists saved exhibitions; empty state explains how to save |
| `/sign-in` | Sign in | email and password validated; wrong credentials show an error; demo accounts can be filled in with one click; after success the user lands on the page for their role (visitor: home, curator: Studio, admin: Administration) with a greeting |
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

## App-wide rules

- Montenegrin (Latin script, never Cyrillic) and English for all UI text; content fields are `{ me, en }`.
- Accessible: semantic HTML, every image has `alt`, every input has a label, visible focus, text contrast of at least 4.5:1, reduced motion respected.
- Colors, fonts and radius only from the tokens in `frontend/src/index.css`.
- Images and videos are freely licensed (Wikimedia Commons); the author and licence are shown with each object.

## Later (not in the MVP)

- Real backend, database and authentication (Workshop 4).
- Upload of images and videos by curators; a media library.
- Reordering sections by drag and drop; several objects per section in the editor; live preview.
- User management by admins (create accounts, change roles); editing the About and Collections pages from the app.
- Search inside exhibition texts; sharing and QR codes.

## Out of scope

Payments, comments from visitors, real-time collaboration, and offline use.

## Open questions

- Which digitized objects and metadata fields will the library provide, and in which formats (images, IIIF, audio)?
- Who may publish: any admin, or a separate editor role?
- Should visitors need an account at all, or are favorites enough in the browser?
