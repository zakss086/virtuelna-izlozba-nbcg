from __future__ import annotations

from app.utils.exceptions import ForbiddenException, InvalidRequestException, NotFoundException


class MediaNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__(message="Media file not found", code="media_not_found")


class NotMediaOwnerException(ForbiddenException):
    def __init__(self) -> None:
        super().__init__(
            message="Only the uploader or an admin can delete this file", code="not_media_owner"
        )


class UnsupportedMediaTypeException(InvalidRequestException):
    def __init__(self) -> None:
        message = "Only JPEG, PNG, WebP and GIF pictures and MP4 and WebM videos are accepted"
        super().__init__(
            message=message, code="unsupported_media_type", field_errors={"file": message}
        )


class FileTooLargeException(InvalidRequestException):
    def __init__(self, limit_mb: int) -> None:
        message = f"The file is larger than {limit_mb} MB"
        super().__init__(message=message, code="file_too_large", field_errors={"file": message})
