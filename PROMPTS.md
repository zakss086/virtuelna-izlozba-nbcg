# Prompts and AI workflow

How the app was built with Claude Code (AI-DEV 2026, Workshops 3 and 4, both finished). The original requests were written in Montenegrin; they are paraphrased here in English. The log follows the order in which things happened and ends with what went wrong and what was learned.

Related documents: [`CLAUDE.md`](CLAUDE.md) (rules for the agent), [`SPEC.md`](SPEC.md) (product), [`PLAN.md`](PLAN.md) (milestones), [`docs/entities.md`](docs/entities.md) (data and API contract), [`frontend/DESIGN.md`](frontend/DESIGN.md) (design).

## At a glance

| | |
|---|---|
| Commits | 66, in nine days (23 to 31 October 2026) |
| Source files | 204 TypeScript files in `frontend/src`, in 10 features (`exhibitions`, `auth`, `favorites`, `collections`, `about`, `assistant`, `libraries`, `content`, `media`, `audit`), and 79 Python files in `backend/app`, in 9 domains |
| Screens checked | all public and staff pages, at 375 px and 1440 px, in both languages |
| Screenshots in the README | 18 |
| Automated tests | 172 in the backend (unit with mocked services, integration on SQLite and on Postgres); CI runs them on every push |
| Checks run after each change | `typecheck`, `lint` (including the feature boundary check), `build` |

## 1. Way of working

| Principle | How it was applied |
|---|---|
| Plan before code | The agent read the workshop material and wrote `PLAN.md` and a list of open questions before any code was written. |
| Rules in files, not in chat | Architecture, design and language rules live in `CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/DESIGN.md` and `.claude/`, so every session starts from the same rules. |
| Small steps | One topic per request, one commit per step. |
| Verify every step | `pnpm typecheck`, `pnpm lint` and `pnpm build` after each change; changed screens opened in the browser at 375 px and 1440 px. |
| Audit before delivery | A review of the whole project against the workshop rules before the final push. |

## 2. Setup and research

| Request | Result |
|---|---|
| Create a project folder for the virtual exhibitions of the National Library of Montenegro, with `frontend` and `backend` folders. | Monorepo skeleton. |
| Connect to my Slack and read the instructions for this exercise. | The workspace had no instructions, so they were taken from the workshop slides and four example repositories instead. |
| Here is a PDF of an existing exhibition portal. Build a more modern and advanced version with more templates. Do not build anything yet, only look. | The reference was studied; a modernized concept with five templates was proposed. |
| Here are the slides and example repos. Study them, follow the structure, folders, agent instructions and token efficiency, make a plan, and ask what is unclear. | `PLAN.md` and a list of questions. |

### Decisions taken after the questions

- Bilingual: Montenegrin (Latin script) and English.
- Working alone; frontend first, backend in the next workshop.
- Templates: timeline and gallery, plus map, slider and something new such as 3D. The result must not copy the original portal.
- Visual identity from nb-cg.me, content from nb-cg.me and dlib.me.
- Roles: visitor, curator, admin.
- Start from the workshop starter repository.

## 3. Build

| Request | Result |
|---|---|
| Continue with the full build in one pass: design tokens, i18n, mock API, viewers, roles, studio and admin. | Starter copied; design tokens; i18n; mock entities and API; five viewers; auth with roles; curator studio; admin queue; favorites. |
| The menu is a bit dry. Add an About card and a video gallery, improve the visual design, and use real images from the internet. | About, Collections and Video pages; freely licensed images and videos from Wikimedia Commons; hero, stats, animations. |
| Add the nb-cg.me logo somewhere suitable, then make it larger and more visible. | Logo in header and footer on a light plate, with an accessible name. |
| Make the fonts and menus a shade more modern, but keep a historical touch. | Fraunces and Inter; gold sliding underline; double gold rule under the header; ornament dividers. |
| The links to the collections do not work. | The `njegos.dlib.me` certificate had expired (not a bug of ours); the link now points to a working page. |
| After sign-in, redirect to the right page and add a profile page. | Role-based landing page, greeting banner, `/profile` with name, role and saved exhibitions. |
| Use authentic images that match each topic, and show only books and documents in the hero. | Images replaced per topic with titles and licences; hero rotates three book and document scans. |

### Example of a complete prompt

This is the shape of a request that worked well: it names the screen, the behaviour and the "done" criterion.

> After signing in, the user should land on the page for their role: visitor on the home page, curator in the Studio, admin in Administration. Show a short greeting that disappears by itself. Add a `/profile` page for any signed-in user with name, e-mail, a short description of the role and the saved exhibitions. Keep the rules from `CLAUDE.md`: no feature imports another feature, texts in both languages. Done when typecheck, lint and build pass and all three roles were tried in the browser.

## 4. Quality and process

| Request | Result |
|---|---|
| Is everything done according to the workshop rules? | A real audit found: colors hardcoded in components, data fetched in routes, files over 300 lines, a native select, one hardcoded string, a `div` with `onClick`, spacing off the scale. |
| Fix everything, but be careful not to break anything. | Fixed in small commits, each checked with typecheck, lint, build and a browser test. |
| Which process rules from the workshop can you apply here? | The `/check` routine over all 16 screens at 375 px and 1440 px, plus accessibility and contrast checks. It found that stats showed 0 while loading. |
| Look at the screenshots and fix what is wrong. | The header wrapped for staff accounts; it now fits and switches to a hamburger below 1280 px. |
| The dark theme does not work well. Check text visibility and where it can go wrong, then propose what to do. | A contrast scan of 9 pages and the dark-mode screenshots found the real cause (see section 5), and a proposal with three options. |
| Fix it using option A. | A new `on-ink` token for light text on dark surfaces, applied in 8 files; re-scan found no low-contrast text. |
| Check the rest, and whether the visual identity is consistent everywhere. | Review of 14 screens in dark mode at 1440 and 375 px: the identity is consistent; faint form borders, a bright map and a drop-cap misalignment were listed. |
| Add a libraries map that does not depend on COBISS; pull the list of libraries from the internet. | A new `libraries` feature: 39 libraries (names from the COBISS.CG 2025 statistics, coordinates from OpenStreetMap), search, type filter, exact and approximate pins, sources shown on the page. A scrape of OpenStreetMap alone gave only 16 noisy entries, so it is used for coordinates, not for the list. |
| Polish the frontend in a historic-modern way: make the logo readable and nicer, and add graphic details so it is less dry. | Done on its own branch: the logo on a plate with a thin gold frame (the official file is only 167 x 83 px, so it is not enlarged), a braid band above the footer, a framed hero with captions, a gold frame on card images on hover, manuscript-red initials and a faint paper grain. Contrast and header layout were re-measured. |
| We do not need accounts for visitors; replace the word "predložak" with a better Montenegrin term everywhere. | The visitor role and demo account were removed (visitors browse and keep favorites in the browser; only curators and admins sign in), and "predložak" became "način prikaza" in the UI, the assistant and the Montenegrin README. |
| Name it "interactive map", explain what it is for, show library photos on it, and offer visitors more (exhibitions, other information). | Page renamed to `/map`; photo pins for the four buildings with a free photo on Wikimedia Commons (no invented photos for the rest); a second layer with the places named in exhibitions, each linking back to its exhibition; detail cards with photo credit, facts and contact; a "nearest library" button that uses the browser location only on click. |
| Add AI support for visitors and curators, but simulate it so it does not spend resources. | A demo assistant (floating button, answers from site content and ready-made guides in both languages, labelled as a demo) and a rule-based exhibition check in the editor. Neither calls an AI service. |
| Add a page-turning 3D book and an attractive rotating carousel as new exhibition templates. | Two new templates (`book`, `carousel`) with a sample exhibition each: a book with a cover, one spread per section, credits and a 3D sheet turn (one page at a time on phones), and a 3D ring carousel with autoplay, pause, swipe and keyboard. Both respect reduced motion; the template list, filters, stats, assistant guide and `docs/entities.md` were updated. |
| How can the seven templates look more serious and professional? Do all of it. | A shared exhibition page frame (curator's introduction, facts, citation, "view as" switch, full screen, printable PDF catalogue, related exhibitions); richer objects (zoom, shelf mark, language, material, dimensions, licence-aware download, optional fields in the editor and in `docs/entities.md`); and viewer extras: timeline year ruler, gallery filters and sorting, map popups, 3D hall loading bar and object list, book contents, carousel thumbnails. Marker clustering and a 3D mini-map were left out as not worth the weight for the current data. |
| Do the merge with the backend (the Workshop 4 starter repository), and tell me when to build the CMS. | The starter was copied into `backend/` and its example domain replaced: staff sign-in (curator and admin, no visitors), exhibitions with sections, objects and videos, the draft -> pending -> published flow and the access rules enforced on the server, a users list for admins, a migration, a seed exported from the frontend samples and 52 tests. The frontend got `src/lib/http.ts` and a `*-http.ts` next to every `*-mock.ts`, chosen by `VITE_API_MODE`: `pnpm dev` still runs on mock data (the desktop shortcut), `pnpm dev:api` on the API. The contract in `docs/entities.md` now describes the real API. The CMS (site content, media library, libraries, accounts) is the next step, listed in `backend/README.md`. |
| Start the CMS: editable site content first. | A `content` domain in the backend (table `content_blocks`, `GET/PUT/DELETE /api/content`, admin-only writes, 21 new tests) and a `content` feature in the frontend: the page `/admin/content` edits 62 texts in both languages (seven groups, search, and a check that marks like `{title}` stay in the text), and `t()` takes an edited text over the default (a small store in `lib/`, filled by `app/content-sync.tsx`). Checked in the browser against the real API: an admin saved a text and a signed-out visitor saw it on the About page. |
| Next step of the plan: the media library, with upload of pictures and videos. | A `media` domain in the backend (table `media_assets`, `GET/POST/DELETE /api/media`, files under `MEDIA_DIR` served at `/media`, the type decided from the file content, a size limit, 24 new tests) and a `media` feature in the frontend: the page `/studio/media`, and a picker for the picture of each object in the editor (through a slot that the route fills, so the two features stay apart). Editing an exhibition now also keeps real pictures, which it used to replace with generated ones. Checked in the browser: upload through the dev proxy, a fake PNG refused, the picture chosen, saved as the object and the cover, and removed with its file. |
| Continue: libraries on the map and collections as data an admin edits. | Two domains in the backend (`libraries` with an all-or-nothing position enforced by a database check, `collections`; public reads, admin-only writes; a shared `require_admin`; seed from `export-seed`; 25 new tests, 122 in total) and the frontend: both read from the API with `pnpm dev:api`, and Administration has lists and forms for them (an emptied optional field is sent as `null`, which clears it). Checked in the browser: 39 libraries listed, a pin added, an incomplete pin refused, a phone and a pin cleared, a collection created, moved and deleted. |
| Is there a way to add a library in "Libraries on the map"? Add a way to place it by clicking on the map, and a shortcut on the map. | The library form got a small map: a click fills latitude and longitude (and sets the accuracy to exact), typing the coordinates moves the pin, and the three values are checked together. The Map page shows an admin "Add a library" and, for the selected library, "Edit" (put in place by the route, so the libraries feature does not depend on auth). Checked in the browser: a click on the map filled the fields and the library was saved with its pin. |
| Fix what is needed. Also: does the user get notices when something fails or loads slowly, and is the site built on modern design principles? | Audit of user feedback, then toasts for every action, an error notice with a retry button, an offline banner, a delete dialog instead of `window.confirm`, and polite bilingual messages. |
| Build account management (an admin creates accounts, sets roles, switches accounts off), and rename "Staff sign-in" to just "Sign in". | Backend: create and change accounts (role, on/off, new password), an `is_active` column with its migration, a switched-off account refused at sign-in and its token refused at once, an admin cannot demote or switch off themselves; frontend: a table with a role select, switch and new password per row, and a form for a new account; 24 new tests. Checked in the browser against the real API: an account was created, switched off, and its old token answered `invalid_token`. |
| Fix everything that needs fixing, optimize, and check all pages so that nothing is clipped wrongly or too much. | A scripted audit of every public and staff page at 375 px and 1440 px in both languages (page overflow, elements out of view, clipped text, broken images, missing labels, raw translation keys): one real finding (a select that clipped 3 px of text). Every page now loads on demand: the main bundle fell from 895 kB to 320 kB (268 to 99 kB gzipped). |
| Add a history of changes. | An `audit` domain: a table written by the other services in the same transaction as the change (exhibitions with each status move, site texts, libraries, collections, accounts, uploaded files), an admin-only `GET /api/audit` with a filter, and a page `/admin/history`. The detail is stored as codes and translated in the browser, so one entry reads right in both languages; passwords are never written. 15 new tests. |
| The video gallery should be more modern and prettier, with some effects. | Three variants on temporary routes (`/v1` theatre, `/v2` mosaic with hover previews, `/v3` film strip) with screenshots; the film strip was chosen, the other two deleted. Used on the video page and on the home page. |
| Give me three proposals for a more modern look of the whole site. | Three looks (A gallery, B dark cabinet, C manuscript) as a temporary switcher on the real site, each checked at both widths. The owner kept the original look, so all three were removed again with a revert commit. |
| Can videos from YouTube and social networks be added, and what makes the site compatible with international services and aggregators? | Answered first (what is possible and what is not worth it), then built the cheap part: a YouTube or Vimeo link in the editor, loaded only on play through the privacy-friendly player; the backend answers `/exhibitions/:slug` with title, picture and structured data in the head, plus `sitemap.xml` and `robots.txt`; 10 new tests, including text that tries to break out of the tags. The editor had no field for videos at all, so one was added. |
| Add a checkbox "let visitors change the way it is shown". | A new exhibition field `allowViewSwitch` (default on) with a migration, in the API, the editor and the contract; when off, the "View as" choice is hidden and a hand-typed `?view=` is ignored. |
| Is the interactive map right, and what could make it more attractive and useful? Do 1 to 6. | The map frames Montenegro and has a toned-down base map; pins with an icon per kind of library and a legend; distance to every library, the list sorted by it, "Directions" and "Copy link"; a list/map switch on phones; a time slider with a play button; a numbered route for the selected exhibition's stops. |
| The map behaves oddly when scrolling and clips the main bar; clicking a library card on the left does not select it on the map. | The map had its own z-index range (400 to 1000) above the sticky header (40), so it now has its own stacking context; the title of a card is a button stretched over the whole card, and a library without a pin can be selected too. |
| Extract the course starters to the desktop as they were on GitHub, then put back into the project everything the course prescribes. | Clean copies of the frontend and backend starters in `Polazne osnove`. Comparing them with the project showed that the merge of the backend had dropped the reviewer agents, the commands, the hooks, the course's settings and the CI; they were restored and adapted to a repository whose backend is in `backend/`. Two skill descriptions and two agent descriptions were invalid YAML (an unquoted colon) and were quoted. |
| Update GitHub in the style so far with what has been done, now that both workshops are finished; check that the screenshots match the current state. | README (English and Montenegrin), PLAN, SPEC and this file brought up to date, with the state "complete after Workshop 4". All 21 screenshots were retaken by a script (headless Chrome over the DevTools protocol, at the sizes of the old ones, with the mock accounts signed in where a page needs it), so every picture matches the current look; new ones show the film strip, the new map, account management and the history of changes. The phone pictures are now a true 375 px. |

## 5. What the agent got wrong, and how it was fixed

Reviewing the result critically was part of the work. These are the real problems found and how each was resolved.

| Problem | Cause | Fix |
|---|---|---|
| 3D hall rendered black. | Space-separated `hsl()` colors are not accepted by the 3D library; picture frames sat behind the wall box. | Comma-separated colors in `lib/scene-palette.ts`; frames moved in front of the wall. |
| 3D pictures failed to load. | The Wikimedia redirect URL has no CORS headers, which WebGL textures require. | Direct thumbnail URLs for the hall, plus an error boundary per frame that falls back to a generated picture. |
| Header broke for staff accounts. | More items (Studio, Administration, name, sign-out) did not fit at 1280 to 1720 px. | Hamburger below 1280 px; header layout measured for 4 roles at 10 widths (40 of 40 combinations correct). |
| Stats showed 0 while loading. | The numbers were rendered before the data arrived. | A dash is shown until the data is loaded. |
| Some images did not match the topic. | A first pass picked images by search term. | Every image was checked against its caption and replaced where needed (for example a photo of another region labelled as Montenegro, and a 1918 masthead used for a 1873 event). |
| Dark theme: text invisible in the header, hero and footer. | The ink surfaces used `text-primary-foreground`, which is dark in dark mode (meant for gold buttons), so text was dark on dark (contrast about 1.1:1). | New `on-ink` token that stays light in both themes, used on every ink surface. |
| Users got no feedback when an action succeeded or failed. | Mutations had no callbacks, errors were a generic line without a retry button, and delete used the browser's `confirm`. | Toast store and `Toaster`, `ErrorNotice` with retry, `OfflineBanner`, and a styled confirmation dialog. |
| Faint borders on form fields (about 1.3:1). | The input border token was almost the page color. | `--input` raised to at least 3:1 against the page in both themes. |
| Component library generated a wrong import. | The shadcn CLI wrote `import { cn } from "cn"`, an unrelated npm package. | Import changed to `@/lib/utils`; the package was removed; `package.json` unchanged. |
| Staff could not add videos to an exhibition. | The editor kept the videos of an existing exhibition but had no fields to add or change them, and nothing in the checks noticed. | A "Videos" section in the editor (titles and descriptions in both languages, link, author, licence, page of the original). |
| The map page crashed in a narrow window (`Invalid LatLng (NaN, NaN)`). | The map was built inside a hidden box, and Leaflet cannot frame a map of size zero. | The map is built only while it is visible, and it measures itself again when its box changes. |
| The map slid over the sticky header while scrolling. | Leaflet's panes use z-index 400 to 1000; the header is 40. | `isolation: isolate` on the map, so the whole map stays under the header and the dialogs. |
| Only a small button on a library card selected it on the map. | The click handler was on the button only. | The title is a button stretched over the card; the other button stays above it. |
| The backend's agents, hooks and CI were missing from the project. | They were left out when the starter was merged into the monorepo, and nothing compared the result with the original. | Restored from a clean copy of the starter; the hooks were adapted to `backend/` and tested one by one. |
| A script that stops the servers it started also stopped the owner's own dev server. | It stopped processes by port, not by the process it had started. | Only processes started by the agent are stopped; for the rest the owner is asked. |

## 6. Delivery

README (English and Montenegrin) with screenshots, repository description and topics, a release, `SPEC.md`, `PLAN.md`, `docs/entities.md`, the backend's own README and this file, all kept in step with the code (the contract changes in the same commit as the API). A CI workflow runs the checks on every push. The project is marked as an unofficial educational demo.

## 7. Lessons

- Ask for a **plan first**, then build in small steps and commit after each one.
- Put rules into files (`CLAUDE.md`, `DESIGN.md`) so they hold in every session and cost no extra tokens in chat.
- Ask for an **audit against the rules** before the final push; it finds things you did not ask about.
- **Look at the result in the browser** at 375 px and 1440 px. Screenshots found layout bugs that automated checks missed.
- Keep prompts specific: name the files or screens and say what "done" looks like.
- **Compare a merge with the original.** Merging a starter into a larger repository silently dropped parts of it (agents, hooks, CI); a file-by-file comparison with a clean copy found them.
- Stop only the processes you started, and check what a command will touch before you run it.
- Offer two or three variants of something visual and let the owner choose; the owner may well keep the original, and a branch or a revert makes that cheap.
- Treat the agent's output as a draft: check images, links and layout yourself, because they look right until they are opened.
