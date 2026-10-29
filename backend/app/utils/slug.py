from __future__ import annotations

import re
import unicodedata

_MAX_SLUG_LENGTH = 150


def slugify(text: str) -> str:
    """URL-safe slug: lowercase ASCII words joined by dashes (`Đurđe` becomes `djurdje`)."""
    folded = text.lower().replace("đ", "dj")
    ascii_text = unicodedata.normalize("NFD", folded).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return slug[:_MAX_SLUG_LENGTH].strip("-") or "exhibition"
