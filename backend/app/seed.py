"""Demo data for development: `poetry run seed`. Idempotent: running it twice changes nothing.

The staff accounts match the frontend's mock sign-in, and `app/seed_data/exhibitions.json` is exported
from the frontend's sample exhibitions (`pnpm export-seed` in `frontend/`), so both modes show the same content.
"""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from pathlib import Path

from app.auth.password import hash_password
from app.database.session_handler import db_session_handler
from app.exhibitions.repositories.exhibition import IExhibitionRepository
from app.exhibitions.schemas.exhibition import ExhibitionCreateRequestSchema
from app.exhibitions.services.exhibition import build_exhibition
from app.users.models.user import User, UserRole
from app.users.repositories.user import IUserRepository
from app.utils.di import get_from_di_container

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "demo1234"
SEED_FILE = Path(__file__).parent / "seed_data" / "exhibitions.json"

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
