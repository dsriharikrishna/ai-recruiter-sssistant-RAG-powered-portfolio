from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENV: str = "development"
    LOG_LEVEL: str = "info"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Vector Embedding dimension constant
    EMBEDDING_DIM: int = 1536

    # Secrets - No default values! Must be provided via environment or .env
    DATABASE_URL: str = ...  # type: ignore[assignment]
    REDIS_URL: str = ...  # type: ignore[assignment]
    JWT_SECRET_KEY: str = ...  # type: ignore[assignment]
    OPENAI_API_KEY: str = ...  # type: ignore[assignment]

    JWT_ALGORITHM: str = "HS256"
    JWKS_URL: str | None = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DEV_AUTH: bool = False

    CORS_ORIGINS: str | list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    def validate_security(self) -> None:
        """Enforces security rules such as refusing DEV_AUTH in production."""
        if self.ENV.lower() == "production" and self.DEV_AUTH:
            raise ValueError(
                "Security violation: DEV_AUTH cannot be enabled when ENV=production"
            )


settings: Settings | None = None


def get_settings() -> Settings:
    global settings
    if settings is None:
        settings = Settings()
        settings.validate_security()
    return settings
