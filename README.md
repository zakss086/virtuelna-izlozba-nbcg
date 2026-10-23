# Virtual Exhibitions of the National Library of Montenegro

Bilingual (Montenegrin Latin / English) virtual exhibition platform. Frontend with mock data; backend comes in Workshop 4.

## Run
```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm typecheck && pnpm lint && pnpm build
```
Requires Node 22+ and pnpm.

## Demo accounts (password `demo1234`)
| Role | Email |
|---|---|
| Visitor | ana@visitor.me |
| Curator | marko@nb-cg.me, nikola@nb-cg.me |
| Admin | jelena@nb-cg.me |

## What is inside
- Home with image hero, stats, featured exhibition and video teaser; pages About, Collections and Video gallery
- Catalog with search and template filter (URL-synced), favorites, language and theme switch
- Five exhibition viewers: timeline, gallery, map story, slider (before/after), 3D room
- Curator studio: create, edit, delete exhibitions, submit for publishing (react-hook-form + Zod)
- Admin: review queue (publish or return to draft) and users list
- Sample content is illustrative. Images and videos are freely licensed files from Wikimedia Commons (author and licence shown with each object); some objects fall back to generated placeholders

## Structure
`frontend/src/features/{exhibitions,auth,favorites}` (each with `api/`, `components/`, `types.ts`), routes in `frontend/src/app/routes`, shared code in `frontend/src/lib` and `frontend/src/components`. See `CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/DESIGN.md`, `docs/entities.md`, `PLAN.md`.
