from __future__ import annotations

from app.utils.exceptions import NotFoundException


class LibraryNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__(message="Library not found", code="library_not_found")
