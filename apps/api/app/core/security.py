import uuid
from abc import ABC, abstractmethod
from typing import Any

import jwt
from fastapi import Header, Request
from jwt import PyJWKClient

from app.core.config import get_settings
from app.core.errors import UnauthorizedError


class TokenVerifier(ABC):
    """Abstract interface for JWT token verification."""

    @abstractmethod
    async def verify_token(self, token: str) -> dict[str, Any]:
        """Verify the JWT token and return decoded claims."""
        pass


class JWKSTokenVerifier(TokenVerifier):
    """JWKS-based token verification for external OIDC/OAuth providers."""

    def __init__(self, jwks_url: str) -> None:
        self.jwks_client = PyJWKClient(jwks_url)

    async def verify_token(self, token: str) -> dict[str, Any]:
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_exp": True},
            )
            return payload
        except Exception as e:
            raise UnauthorizedError(f"Invalid token: {e}") from e


class SecretKeyTokenVerifier(TokenVerifier):
    """HMAC/Symmetric key token verification."""

    def __init__(self, secret_key: str, algorithm: str = "HS256") -> None:
        self.secret_key = secret_key
        self.algorithm = algorithm

    async def verify_token(self, token: str) -> dict[str, Any]:
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_exp": True},
            )
            return payload
        except Exception as e:
            raise UnauthorizedError(f"Invalid token: {e}") from e


def get_token_verifier() -> TokenVerifier:
    settings = get_settings()
    if settings.JWKS_URL:
        return JWKSTokenVerifier(settings.JWKS_URL)
    return SecretKeyTokenVerifier(
        secret_key=settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


async def get_current_owner(
    request: Request,
    authorization: str | None = Header(None, alias="Authorization"),
    x_dev_user: str | None = Header(None, alias="X-Dev-User"),
) -> uuid.UUID:
    """Dependency that derives owner_id securely from verified token or dev auth."""
    settings = get_settings()

    # 1. Dev Auth mode check
    if settings.DEV_AUTH:
        if settings.ENV.lower() == "production":
            raise UnauthorizedError("DEV_AUTH is strictly forbidden in production mode")
        if x_dev_user:
            try:
                return uuid.UUID(x_dev_user)
            except ValueError:
                # If a raw string is passed, generate a deterministic UUID
                return uuid.uuid5(uuid.NAMESPACE_DNS, x_dev_user)

    # 2. Authorization Header check
    if not authorization:
        raise UnauthorizedError("Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedError(
            "Invalid Authorization format. Expected 'Bearer <token>'"
        )

    token = parts[1]
    verifier = get_token_verifier()
    payload = await verifier.verify_token(token)

    # Subject claim is the owner_id
    sub = payload.get("sub")
    if not sub:
        raise UnauthorizedError("Token missing subject (sub) claim")

    try:
        return uuid.UUID(str(sub))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(sub))
