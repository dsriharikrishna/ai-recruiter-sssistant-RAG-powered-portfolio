import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_settings_missing_secrets_raises_error(monkeypatch: pytest.MonkeyPatch) -> None:
    # Clear secrets from environment
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("REDIS_URL", raising=False)
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with pytest.raises(ValidationError):
        Settings()


def test_settings_loaded_successfully(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "DATABASE_URL", "postgresql+asyncpg://user:pass@localhost:5432/db"
    )
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    monkeypatch.setenv("JWT_SECRET_KEY", "super-secret-key-that-is-long-enough")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-proj-testkey123")
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000,http://example.com")

    settings = Settings()
    assert settings.DATABASE_URL == "postgresql+asyncpg://user:pass@localhost:5432/db"
    assert settings.REDIS_URL == "redis://localhost:6379/0"
    assert settings.JWT_SECRET_KEY == "super-secret-key-that-is-long-enough"
    assert settings.OPENAI_API_KEY == "sk-proj-testkey123"
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    assert "http://example.com" in settings.CORS_ORIGINS
