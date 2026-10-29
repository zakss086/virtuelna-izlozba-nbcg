# Backend

Python 3.13 · FastAPI · SQLAlchemy 2 (typed `Mapped[]`) · Pydantic 2 · Alembic · PyJWT + bcrypt · kink (DI) ·
pytest · ruff + black + mypy (strict) · Poetry. SQLite by default, Postgres via `DATABASE_URL`.
Entities and the API contract are in @../docs/entities.md (shared with the frontend in this monorepo: a contract change
is made in the same commit as the backend and frontend change). All code, identifiers, comments, commit messages and docs
are in English; you may talk to me in any language. How to run it: @README.md. Why we do things this way: `.claude/decisions.md` (ADRs).

## Read before writing code

| Task | Read first |
|------|-----------|
| New entity (model + schemas + repository + service + api + tests) | `app/exhibitions/` is the reference domain |
| Model or migration | `.claude/rules/backend-db.md` · ADR-003, ADR-004, ADR-007, ADR-008 in `.claude/decisions.md` |
| Endpoint or schema | `.claude/rules/backend-api.md` · ADR-005, ADR-006, ADR-010, ADR-014, ADR-016 |
| Service, repository, query, ownership | `.claude/rules/backend-db.md`, `.claude/rules/anti-patterns.md` · ADR-006, ADR-009, ADR-012, ADR-015 |
| Auth, tokens, settings | `app/auth/services/auth.py`, `app/deps.py`, `app/config/settings.py` · `.claude/rules/safety.md` |
| Tests | `.claude/rules/backend-tests.md` · ADR-011 |
| Something that went wrong before | `.claude/frequent-mistakes.md` |

`.claude/rules/anti-patterns.md` and `frequent-mistakes.md` use a `Listing` domain in their examples: it is the starter's example
entity, which the exhibitions domain replaced; the lessons apply unchanged.

## One package per domain
Every domain lives in `app/<domain>/` with one folder per role, each holding one module per entity:
`api/` (endpoints on a `DBAPIRouter`), `services/` (`I<Name>Service` Protocol + `@inject` class: rules,
ownership, domain exceptions, returns response schemas), `repositories/` (`I<Name>Repository` + class:
queries on the session, `flush()`, never `commit()`), `models/` (tables), `schemas/` (request/response),
`exceptions/` (subclasses of `app/utils/exceptions.py` with a `code`), and `routes.py` (the domain's
`APIRouter` with tags) registered in `app/routes.py`. No `__init__.py` below `app/` (ADR-014).
Dependency direction: utils/database/config -> domain -> app, never the other way around.
An aggregate (an exhibition with its sections, objects and videos) keeps its tables in one models module.

## Structure
- `manage.py`: `poetry run start | test | lint | typecheck | makemigrations "<what>" | migrate | seed`
- `app/main.py`: settings into the DI container, logging, `app = setup_app()`
- `app/app.py`: `setup_app()`, exception handlers (one error shape), CORS, `/live`, `/ready`
- `app/routes.py`: `api_router` with prefix `/api`; every domain's `routes.py` is included here
- `app/deps.py`: `get_di_entity(IService)`, `get_current_user` (401 without a token), `get_optional_user`
- `app/config/settings.py`: `Settings` / `DBSettings` from the environment and `.env`
- `app/database/`: `Base`, `SessionFactory` (`ISessionFactory`), `DBAPIRouter` + `db_session_handler`, `load_all_models()`
- `app/utils/`: `di.py`, `exceptions.py`, `schemas.py` (`CamelCaseModel`, `CamelCaseResponseModel`, `UtcDatetime`), `pagination.py` (`Page[T]`, `paginate`), `slug.py`, `logging.py`
- `app/auth/`: sign-in/me, `password.py` (bcrypt), `services/auth.py` (JWT HS256), `schemas/auth.py` (`CurrentUser` with `role`)
- `app/users/` (staff accounts, admin list), `app/exhibitions/` (reference domain), `app/seed.py` + `app/seed_data/`
- `alembic/versions/`: one migration per schema change, generated with `poetry run makemigrations`
- `tests/unit/` (API layer with mocked services, `MockSessionFactory`), `tests/integration/` (real temp SQLite; fixtures `client`, `sign_in`, `auth_headers`, `other_auth_headers`, `admin_headers`, `exhibition_id`)

## Rules
- Every file starts with `from __future__ import annotations`; ruff, black and mypy strict must pass (ADR-017)
- Endpoints stay thin: `Depends(get_di_entity(IFooService))`, one service call, return the response schema; no queries, no `if` on ownership, no status codes in a service; plain `def`, not `async def` (ADR-014, ADR-009)
- A service has a Protocol and `@inject(alias=IFooService)`; a repository takes `ISessionFactory` and only flushes; the endpoint's `DBAPIRouter` commits or rolls back (ADR-009, ADR-015)
- Schemas extend `CamelCaseModel` / `CamelCaseResponseModel` (camelCase JSON); endpoints return schemas, never models; lists return `Page[...]` (ADR-010, ADR-016)
- Every write endpoint takes `current_user: Annotated[CurrentUser, Depends(get_current_user)]`; the author is always `current_user.id`, never an id from the body (ADR-006)
- Errors are domain exceptions (`NotFoundException`, `ForbiddenException`, `ConflictException`, ...) with a `code`; the client receives `{"detail", "code", "fieldErrors"?}` (ADR-005)
- Models use `Mapped[]` + `mapped_column`, `TIMESTAMP(timezone=True)` with `server_default=func.now()` (never `DateTime`), `ForeignKey(..., ondelete=...)`, relationships by string name with `TYPE_CHECKING` imports (ADR-008, ADR-009)
- What must hold for every row (unique, allowed values, ranges) is a database constraint, not only a Pydantic check (ADR-007)
- Queries are `select()` on the models; no SQL strings, no `text()` (ADR-012)
- A schema change is a migration: `poetry run makemigrations "<what>"`, read the file, `poetry run migrate`; a committed migration is never edited; no `create_all` in app code (ADR-004)
- Settings come from `app.config.settings` through the container, never `os.environ` in a domain, never hard-coded secrets
- A dependency is proposed (name, why, alternative) and the user runs `poetry add <package>`; `poetry.lock` is never edited (ADR-013)
- If you are not sure how a library API works (FastAPI, SQLAlchemy 2, Pydantic 2, Alembic, kink), check the docs, do not guess
- Never run destructive commands (`rm -rf`, `git reset --hard`, `alembic downgrade`, `DROP`) and never read or print `.env` (`.claude/rules/safety.md`)

## Done when
- `poetry run lint && poetry run typecheck && poetry run test` pass
- Every endpoint has tests: unit (routing, auth, validation with the service mocked) and integration (happy path and 401/403/404/422 where they apply) (ADR-011)
- `poetry run alembic check` reports no missing migration
- `../docs/entities.md` describes every field and route exactly as the code does (ADR-002)
- No secrets in code or in git (`.env` stays local; `.env.example` has placeholders only)
