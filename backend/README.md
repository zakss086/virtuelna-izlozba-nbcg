# Backend

FastAPI + SQLAlchemy 2 + Alembic, built from the Workshop 4 starter
([PavleDz/ai-dev-backend](https://github.com/PavleDz/ai-dev-backend)): one package per domain, services and repositories
behind Protocols, dependency injection, one transaction per request, strict typing (ruff, black, mypy), JWT sign-in.
SQLite by default (no setup), Postgres through `DATABASE_URL`.

The contract with the frontend is [`../docs/entities.md`](../docs/entities.md): every field, route, status code and the error shape.

## What it does

- **Staff sign-in** (`POST /api/auth/sign-in`, `GET /api/auth/me`): curators and admins only. Visitors have no account.
- **Exhibitions** with sections, objects and videos: public list and detail of published ones, create, edit, status flow
  (`draft` -> `pending` -> `published`), delete, with the ownership rules enforced on the server.
- **Users**: admins list, create and change staff accounts (role, on/off, new password); a switched-off account is locked out at once.
- **Media library**: upload of pictures and videos with author and licence, stored on the server and served publicly; the type is decided from the file's content, the size is limited, and a curator sees only their own files (`/api/media`, `/media/...`).
- **Libraries on the map and collections**: public lists, edited by an admin (`/api/libraries`, `/api/collections`), seeded from the frontend sample data.
- **Site content (CMS)**: an admin edits 62 site texts (pages, descriptions of the viewing modes, hints, footer) in both languages (`GET/PUT/DELETE /api/content`); a visitor sees the change at once.

Authorization lives here, not only in the frontend guards: an anonymous caller sees published exhibitions only, a curator also their own,
an admin everything; only the author or an admin changes an exhibition; only an admin publishes.

## Run it

Needs Python 3.13 and [Poetry](https://python-poetry.org/docs/#installation). From `backend/`:

```bash
poetry install        # .venv inside backend/ with everything from poetry.lock
poetry run migrate    # creates data/app.db with all tables (alembic upgrade head)
poetry run seed       # 3 demo staff accounts (password demo1234) and the 10 sample exhibitions
poetry run start      # http://localhost:8000/docs
```

Then, in another terminal from the repo root, run the frontend against it:

```bash
pnpm dev:api          # http://localhost:5173, /api is proxied to port 8000
```

`pnpm dev` (without the backend) keeps working on the in-browser mock data, which is what the desktop shortcut uses.

Demo accounts: `marko@nb-cg.me` and `nikola@nb-cg.me` (curators), `jelena@nb-cg.me` (admin); password `demo1234`.

Configuration is read from `backend/.env` (copy `.env.example`); every variable has a working default. Set a random `JWT_SECRET_KEY`
before the API leaves your computer.

## Everyday commands

```bash
poetry run test                                   # 172 tests: unit (services mocked) and integration (temporary SQLite)
poetry run lint                                   # ruff + black; `--fix` fixes and formats
poetry run typecheck                              # mypy, strict
poetry run makemigrations "what changed"          # after changing a model; read the generated file
poetry run migrate                                # apply migrations
poetry run alembic check                          # fails if a model changed without a migration
pnpm export-seed                                  # from the repo root: refresh app/seed_data/*.json (exhibitions, libraries, collections) from the frontend samples
```

## Postgres

```bash
docker compose up -d db                           # postgres:17 on localhost:5432
echo 'DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/app' >> .env
poetry run migrate && poetry run seed
```

The same models, migrations and tests run on both databases (tried with postgres:17: migration, seed, `alembic check` and all 52 tests pass).

The integration tests create and drop every table, so run them against a **separate** database, never the one you use:

```bash
docker compose exec db createdb -U app app_test
DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/app_test poetry run test
```

The tests refuse to run on a non-SQLite database whose name does not contain `test`.

## Layout

```
app/exhibitions/    models (exhibitions, sections, exhibition_items, exhibition_videos), schemas, repository, service, api
app/content/        edited site texts (CMS): model, repository, service, endpoints
app/media/          media library: model, file store, service (type check by content), endpoints
app/libraries/      libraries of the map: model (all-or-nothing position), service, endpoints
app/collections/    collections of the digital library: model, service, endpoints
app/users/          user model, admin account management
app/seo/            crawler pages: exhibition head tags, sitemap, robots
app/audit/          history of changes: entries written by the other services, admin-only list
app/auth/           sign-in, JWT, password hashing
app/utils/          error shape, camelCase schemas, pagination, DI, slugs
app/seed.py         demo accounts and exhibitions (idempotent); data in app/seed_data/exhibitions.json
alembic/versions/   one migration per schema change
tests/              unit/ (HTTP layer, services mocked) and integration/ (whole stack, temporary database)
.claude/            the starter's decisions (ADRs), rules and frequent mistakes
```

Texts in two languages are stored as JSON (`{"me": ..., "en": ...}`); a PATCH with `sections` or `videos` replaces the whole list.

## Next: the CMS

The exhibition editor (Studio) is a CMS for exhibitions, and the first step of the rest is done: **site content** (`app/content/`, the page `/admin/content`).
What is still data inside the frontend and should move here next:

1. ~~**Site content**~~ (done): the texts of Home, About, Collections, Video and the footer as bilingual blocks edited by an admin (`content_blocks`: key plus `{me, en}`).
2. ~~**Media library**~~ (done): `app/media/`, the page `/studio/media` and the picture picker in the editor; the files are on the server disk, a bucket would be another file store.
3. ~~**Libraries on the map**~~ and the **collections** (done): tables an admin edits in Administration (`/admin/libraries`, `/admin/collections`); `libraries-data.ts` and `collections-data.ts` remain only as the sample data of the mock and the seed.
4. **Accounts and history**: an admin creates and disables staff accounts; a log of who published or changed what.

Each is a new domain package with its own migration, tests and a section in `../docs/entities.md`.

## Rule of the monorepo

A change that touches frontend and backend goes in one commit or pull request, and `docs/entities.md` is updated in the same change.

## Production notes: crawler pages and embeds
- Build the frontend (`pnpm build`) and set `FRONTEND_DIST_DIR` to its `dist` folder and `PUBLIC_BASE_URL` to the public address, e.g. `https://izlozbe.example.me`.
- The reverse proxy (nginx) serves `dist` for everything, but sends `/exhibitions/*`, `/sitemap.xml`, `/robots.txt`, `/api/*` and `/media/*` to the backend. Visitors then get the normal app and crawlers get the exhibition's title, picture and structured data in the head.
- If a Content-Security-Policy is set, allow `frame-src https://www.youtube-nocookie.com https://player.vimeo.com` for embedded videos.
