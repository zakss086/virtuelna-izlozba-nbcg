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
- **Users** list for admins (`GET /api/users`).

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
poetry run test                                   # 52 tests: unit (services mocked) and integration (temporary SQLite)
poetry run lint                                   # ruff + black; `--fix` fixes and formats
poetry run typecheck                              # mypy, strict
poetry run makemigrations "what changed"          # after changing a model; read the generated file
poetry run migrate                                # apply migrations
poetry run alembic check                          # fails if a model changed without a migration
pnpm export-seed                                  # from the repo root: refresh app/seed_data/exhibitions.json from the frontend samples
```

## Postgres

```bash
docker compose up -d db                           # postgres:17 on localhost:5432
echo 'DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/app' >> .env
poetry run migrate && poetry run seed
```

The same models, migrations and tests run on both databases (not tried here: Docker is not installed on the development computer).

## Layout

```
app/exhibitions/    models (exhibitions, sections, exhibition_items, exhibition_videos), schemas, repository, service, api
app/users/          user model, admin list
app/auth/           sign-in, JWT, password hashing
app/utils/          error shape, camelCase schemas, pagination, DI, slugs
app/seed.py         demo accounts and exhibitions (idempotent); data in app/seed_data/exhibitions.json
alembic/versions/   one migration per schema change
tests/              unit/ (HTTP layer, services mocked) and integration/ (whole stack, temporary database)
.claude/            the starter's decisions (ADRs), rules and frequent mistakes
```

Texts in two languages are stored as JSON (`{"me": ..., "en": ...}`); a PATCH with `sections` or `videos` replaces the whole list.

## Next: the CMS

The exhibition editor (Studio) already is a CMS for exhibitions. What is still data inside the frontend and should move here
once the basics are settled:

1. **Site content**: the About page, the collections page and the home captions as bilingual blocks edited by an admin (`content_blocks`: key plus `{me, en}`).
2. **Media library**: upload of pictures and video with author, licence and source, instead of pasted URLs (size and type limits, storage, URLs saved on the objects).
3. **Libraries on the map**: the library list as a table an admin can edit, replacing `libraries-data.ts`.
4. **Accounts and history**: an admin creates and disables staff accounts; a log of who published or changed what.

Each is a new domain package with its own migration, tests and a section in `../docs/entities.md`.

## Rule of the monorepo

A change that touches frontend and backend goes in one commit or pull request, and `docs/entities.md` is updated in the same change.
