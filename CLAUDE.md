# Virtual Exhibitions of the National Library of Montenegro

A bilingual (Montenegrin Latin script + English) platform where curators build interactive exhibitions from library collections and visitors explore them. Inspired by the virtual exhibition portals of national libraries, with eight viewer templates: timeline, gallery, map story, slider, 3D room, page-turning book, carousel and card catalogue.

This is a monorepo: one repository for the whole app.
- `frontend/`: React app (Workshop 3). Details in @frontend/CLAUDE.md
- `backend/`: FastAPI API, database and auth (Workshop 4). Details in @backend/CLAUDE.md
- `docs/entities.md`: entities and the API contract shared by frontend and backend
- `SPEC.md`: product spec (roles, screens, done-when); `PLAN.md`: plan and milestones

## Language
Code, identifiers, comments, commit messages and docs are in English. You may talk to me in any language.
UI copy is bilingual: Montenegrin (Latin script, never Cyrillic) and English. Every UI string goes into `frontend/src/lib/messages.ts` for both languages; content data uses the `Localized` type `{ me, en }`.

## Commands (run from the repo root)
- `pnpm install`: installs dependencies for every package in the workspace
- `pnpm dev`: frontend dev server at http://localhost:5173 on mock data
- `pnpm dev:api`: the same, but data and sign-in come from the backend (start it first: `cd backend && poetry run start`)
- `pnpm typecheck`: TypeScript check
- `pnpm lint`: oxlint and the boundary check between features
- `pnpm build`: production build
- `pnpm format`: Prettier formats `frontend/src/`

## Working in the monorepo
- One change that touches frontend and backend goes in one commit or pull request
- When an entity changes, update `docs/entities.md` in the same change
- Run commands from the root; scripts are forwarded with `pnpm --filter <package>`

## Done when
`pnpm typecheck`, `pnpm lint` and `pnpm build` pass (and, for backend changes, `poetry run lint`, `typecheck` and `test` in `backend/`); changed screens checked at 375 px and 1440 px in both languages with no console errors.
