from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import (
    AppError,
    app_error_handler,
    generic_exception_handler,
    validation_error_handler,
)
from app.core.logging import setup_logging
from app.features.chat.router import router as chat_router
from app.features.health.router import router as health_router
from app.features.profiles.router import router as profiles_router
from app.features.resumes.router import router as resumes_router
from app.features.sites.router import router as sites_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    try:
        settings = get_settings()
        setup_logging(log_level=settings.LOG_LEVEL)
    except Exception:
        setup_logging(log_level="INFO")
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title="AI Recruiter Assistant API",
        version="1.0.0",
        description="Multi-tenant portfolio builder with a RAG recruiter chatbot",
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

    # Feature Routers
    application.include_router(health_router)
    application.include_router(resumes_router)
    application.include_router(profiles_router)
    application.include_router(sites_router)
    application.include_router(chat_router)

    return application


app = create_app()
