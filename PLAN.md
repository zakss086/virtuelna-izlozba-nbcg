# Virtual Exhibitions of the National Library of Montenegro - Plan

**Status:** milestones 1 to 5 are done in the frontend on mock data (all five templates, auth with three roles, curator studio, favorites, video gallery, collections and about pages). Milestone 6 (review, README, push) is in progress; the backend follows in Workshop 4. See README.md for what exists now; the sections below are the original plan.

Reference: NSK Zagreb virtual exhibitions (virtualna.nsk.hr), modernized.
Course: AI-DEV 2026 Workshop 3 (frontend with mock data), Workshop 4 (backend).

## Decisions so far
- Bilingual UI and content: Montenegrin (Latin script) + English. Code, comments, commits, docs in English.
- Solo project. Frontend first (mock data), backend next week.
- Roles: `visitor`, `curator` (creates/edits own exhibitions), `admin` (manages users, publishes, edits all).
- Identity from nb-cg.me: gold `#C9A961` / `#DABC74`, warm off-white `#F9F8F5`, ink `#252525`, grays `#454545` `#5E5E5E` `#CDCBCB`; fonts first Playfair Display + Roboto, later changed to Fraunces (headings) + Inter (body). Tone: formal, institutional, but with a modern editorial feel.
- Sample content from nb-cg.me / dlib.me collections (Njegos, Montenegrina, old and rare books, manuscripts, maps, periodicals like Glas Crnogorca, posters, photos and postcards).

## Starter
Copy `jovanp-najveci/ai-frontend-starter` into this folder as the base:
`.claude/` (rules, commands, agents, skill, hooks, settings), `.mcp.json` (Playwright, shadcn, Context7),
root `CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/DESIGN.md`, `docs/entities.md`, pnpm workspace.
Needs Node 22+ and pnpm.

## Entities (go to docs/entities.md)
- **Exhibition**: slug, title{me,en}, summary{me,en}, cover, template, status (draft/published), period, authorId, tags.
- **Section**: exhibitionId, order, title{me,en}, text{me,en}, itemIds, date or geo point (per template).
- **Item** (digital object): type (book, manuscript, map, photo, periodical, poster, audio), title{me,en}, creator, year, collection, imageUrl, sourceUrl (dlib.me), rights.
- **User**: name, email, role.
- **Favorite** (visitor saves exhibitions/items).
Relations: Exhibition 1-N Section, Section N-M Item, Exhibition N-1 User.

## Templates (exhibition viewers) - different from Zagreb's five
1. **Timeline**: vertical scroll-driven timeline with sticky media (not the classic horizontal strip).
2. **Gallery**: masonry grid + full-screen lightbox with zoom and metadata panel.
3. **Map story**: scrollytelling over a map (MapLibre), sections fly to locations.
4. **Slider / compare**: before-after and image comparison, horizontal story slides.
5. **3D room** (new): virtual gallery space with Three.js / react-three-fiber, artifacts hung on walls, orbit/walk, with a 2D fallback for low-power devices and accessibility.
Order of delivery: Timeline, Gallery, then Map, Slider, 3D as stretch.

## Screens
Home (featured exhibitions, collections), Exhibitions catalog (search, filters by collection/period/template/language),
Exhibition viewer (template renderer), Item detail, Sign in, Favorites, Curator dashboard (my exhibitions),
Exhibition editor (create/update: sections, items, template, preview), Admin (users, publish queue), 404.
Language switcher in the header (me/en), URL-synced filters, dark mode optional.

## Frontend structure
`src/features/{exhibitions,sections,items,users,favorites}` with `api/` (mock), `components/`, `types.ts`.
`src/app/routes/*`, `src/components/{ui,layout}`, `src/lib/{mock-db,utils,i18n}`.
New shared concern: i18n (react-i18next or lightweight own hook) with `me.json` and `en.json`.

## Agent efficiency (tokens)
- Short CLAUDE.md (under 200 lines), path-scoped rules, commands `/new-feature` `/new-page` `/check`.
- Plan mode before each feature, `/clear` between tasks, commit before big tasks.
- `ui-reviewer` read-only subagent; Playwright screenshots at 375 and 1440 px as proof.
- Optional extra rule: `i18n.md` (no hardcoded UI strings) and a `template-viewer` skill.

## Milestones
1. Scaffold from starter, install, DESIGN.md + tokens, i18n setup.
2. Entities + mock DB + sample content (docs/entities.md).
3. Home + catalog + exhibition viewer (Timeline, Gallery).
4. Auth (mock, 3 roles) + curator editor + favorites.
5. Map, Slider, 3D room.
6. Check, review, README, push to GitHub, post link in Slack.
