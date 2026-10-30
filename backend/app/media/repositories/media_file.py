from __future__ import annotations

import logging
from pathlib import Path
from typing import Protocol

from app.config.settings import Settings
from app.utils.di import inject

logger = logging.getLogger(__name__)


class IMediaFileStore(Protocol):
    """Where the bytes of uploaded files live (the database holds only their records)."""

    def save(self, stored_name: str, data: bytes) -> None: ...

    def delete(self, stored_name: str) -> None: ...


@inject(alias=IMediaFileStore)
class LocalMediaFileStore(IMediaFileStore):
    """Files in a folder on the server (`MEDIA_DIR`); a bucket would be another implementation."""

    def __init__(self, settings: Settings) -> None:
        self._directory = Path(settings.MEDIA_DIR)

    def save(self, stored_name: str, data: bytes) -> None:
        self._directory.mkdir(parents=True, exist_ok=True)
        (self._directory / stored_name).write_bytes(data)

    def delete(self, stored_name: str) -> None:
        try:
            (self._directory / stored_name).unlink(missing_ok=True)
        except OSError:
            # The record is gone either way; a file left behind is a leftover, not an error for the user.
            logger.warning("Could not delete media file %s", stored_name, exc_info=True)
