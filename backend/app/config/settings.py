from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class DBSettings(BaseSettings):
    """Database settings only: alembic and the session factory need nothing else."""

    # SQLite needs no setup. Postgres: postgresql+psycopg://app:app@localhost:5432/app
    DATABASE_URL: str = "sqlite:///./data/app.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    model_config = SettingsConfigDict(env_file=".env", use_enum_values=True, extra="ignore")


class Settings(DBSettings):
    ENVIRONMENT: str = "dev"

    # Development default only. Set a random JWT_SECRET_KEY in .env for anything that leaves your
    # laptop: `python -c "import secrets; print(secrets.token_hex(32))"`.
    JWT_SECRET_KEY: str = "dev-only-secret-change-me-before-sharing"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # Uploaded pictures and videos (the media library): a folder on the server and a size limit per file.
    MEDIA_DIR: str = "./data/media"
    MAX_UPLOAD_MB: int = 50

    # Where the site is reached from outside (links in the sitemap and in share previews), and the folder with the
    # built frontend (`pnpm build` writes frontend/dist) whose index.html the server completes for search engines.
    PUBLIC_BASE_URL: str = "http://localhost:5173"
    FRONTEND_DIST_DIR: str = "../frontend/dist"

    # NOTE: ALLOWED_ORIGINS='["http://localhost:5173","https://app.example.com"]'
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
