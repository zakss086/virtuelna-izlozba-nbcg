from __future__ import annotations

from app.utils.exceptions import NotFoundException


class CollectionNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__(message="Collection not found", code="collection_not_found")
