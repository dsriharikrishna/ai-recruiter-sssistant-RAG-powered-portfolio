from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger("errors")


class AppError(Exception):
    """Base application exception with safe public error messages."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class NotFoundError(AppError):
    def __init__(self, resource: str, identifier: str) -> None:
        super().__init__(
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": identifier},
        )


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Invalid or missing authentication") -> None:
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Access forbidden") -> None:
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)


class TenantIsolationError(AppError):
    def __init__(
        self, message: str = "Access denied: tenant boundary violation"
    ) -> None:
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.warn(
        "Application error occurred",
        path=request.url.path,
        status_code=exc.status_code,
        message=exc.message,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"message": exc.message, "details": exc.details}},
    )


async def validation_error_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = exc.errors()
    logger.info(
        "Request validation error",
        path=request.url.path,
        error_count=len(errors),
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Validation failed",
                "details": [
                    {
                        "loc": [str(loc_item) for loc_item in err.get("loc", [])],
                        "msg": err.get("msg"),
                        "type": err.get("type"),
                    }
                    for err in errors
                ],
            }
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "Unhandled server exception",
        path=request.url.path,
        exc_info=exc,
    )
    # Never leak internal tracebacks or secrets to clients
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"message": "Internal server error"}},
    )
