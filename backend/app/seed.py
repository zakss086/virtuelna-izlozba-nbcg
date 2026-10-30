"""Demo data for development: `poetry run seed`. Idempotent: running it twice changes nothing.

The staff accounts match the frontend's mock sign-in, and `app/seed_data/*.json` (exhibitions, libraries,
collections) is exported from the frontend's sample data (`pnpm export-seed` in `frontend/`), so both modes show
the same content.
"""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.auth.password import hash_password
from app.collections.models.collection import Collection
from app.collections.repositories.collection import ICollectionRepository
from app.collections.schemas.collection import CollectionCreateRequestSchema
from app.database.session_handler import db_session_handler
from app.exhibitions.repositories.exhibition import IExhibitionRepository
from app.exhibitions.schemas.exhibition import ExhibitionCreateRequestSchema
from app.exhibitions.services.exhibition import build_exhibition
from app.libraries.models.library import Library
from app.libraries.repositories.library import ILibraryRepository
from app.libraries.schemas.library import LibraryCreateRequestSchema
from app.libraries.services.library import library_columns
from app.users.models.user import User, UserRole
from app.users.repositories.user import IUserRepository
from app.utils.di import get_from_di_container
from app.utils.pagination import PaginationParams

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "demo1234"
SEED_DIR = Path(__file__).parent / "seed_data"
SEED_FILE = SEED_DIR / "exhibitions.json"

DEMO_USERS = [
    ("marko@nb-cg.me", "Marko Vuković", UserRole.CURATOR),
    ("jelena@nb-cg.me", "Jelena Đurović", UserRole.ADMIN),
    ("nikola@nb-cg.me", "Nikola Radović", UserRole.CURATOR),
]


@db_session_handler
def seed() -> None:
    user_repository = get_from_di_container(IUserRepository)
    exhibition_repository = get_from_di_container(IExhibitionRepository)

    users: dict[str, User] = {}
    for email, name, role in DEMO_USERS:
        user = user_repository.get_by_email(email)
        if user is None:
            user = user_repository.add(
                User(
                    email=email,
                    password_hash=hash_password(DEMO_PASSWORD),
                    name=name,
                    role=role,
                )
            )
            logger.info("Created %s %s / %s", role, email, DEMO_PASSWORD)
        users[email] = user

    created = 0
    for raw in json.loads(SEED_FILE.read_text(encoding="utf-8")):
        if exhibition_repository.get_by_slug(raw["slug"]) is not None:
            continue
        data = ExhibitionCreateRequestSchema.model_validate(raw)
        exhibition = build_exhibition(
            data=data, author_id=users[raw["authorEmail"]].id, slug=raw["slug"]
        )
        exhibition.created_at = datetime.fromisoformat(raw["createdAt"]).replace(tzinfo=UTC)
        exhibition_repository.add(exhibition)
        created += 1
    logger.info("Created %s demo exhibitions", created)

    _seed_libraries()
    _seed_collections()


def _read(name: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = json.loads((SEED_DIR / name).read_text(encoding="utf-8"))
    return rows


def _seed_libraries() -> None:
    repository = get_from_di_container(ILibraryRepository)
    first = PaginationParams(page=1, size=1)
    if repository.get_all(library_type=None, city="", pagination_params=first).total:
        logger.info("Libraries already exist, nothing to do")
        return
    rows = _read("libraries.json")
    for raw in rows:
        repository.add(Library(**library_columns(LibraryCreateRequestSchema.model_validate(raw))))
    logger.info("Created %s libraries", len(rows))


def _seed_collections() -> None:
    repository = get_from_di_container(ICollectionRepository)
    if repository.get_all(pagination_params=PaginationParams(page=1, size=1)).total:
        logger.info("Collections already exist, nothing to do")
        return
    rows = _read("collections.json")
    for raw in rows:
        data = CollectionCreateRequestSchema.model_validate(raw)
        repository.add(Collection(**data.model_dump(mode="json")))
    logger.info("Created %s collections", len(rows))
