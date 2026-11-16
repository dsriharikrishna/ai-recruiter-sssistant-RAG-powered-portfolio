from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api.v1.ready import router as ready_router
from app.core.config import get_settings
from app.core.errors import (
    AppError,
    app_error_handler,
    generic_exception_handler,
    validation_error_handler,
)
from app.core.logging import setup_logging


class HealthResponse(BaseModel):
    status: str


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    try:
        settings = get_settings()
        setup_logging(log_level=settings.LOG_LEVEL)
    except Exception:
        # Fallback to defaults during unit testing where env may be partial
        setup_logging(log_level="INFO")
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title="AI Recruiter Assistant API",
        lifespan=lifespan,
    )

    try:
        settings = get_settings()
        cors_origins = settings.CORS_ORIGINS
    except Exception:
        cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # CORS Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    application.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    application.add_exception_handler(RequestValidationError, validation_error_handler)  # type: ignore[arg-type]
    application.add_exception_handler(Exception, generic_exception_handler)

    # Health and readiness routes
    @application.get("/health", response_model=HealthResponse, tags=["health"])
    async def health_check() -> HealthResponse:
        return HealthResponse(status="ok")

    application.include_router(ready_router)
    return application


app = create_app()
