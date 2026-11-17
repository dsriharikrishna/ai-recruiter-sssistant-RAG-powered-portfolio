import uuid

import jwt
import pytest
from fastapi import APIRouter, Depends
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.security import get_current_owner
from app.main import app

test_auth_router = APIRouter()


@test_auth_router.get("/v1/protected-test")
async def protected_endpoint(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> dict[str, str]:
    return {"owner_id": str(owner_id)}


app.include_router(test_auth_router)


def test_unauthenticated_request_returns_401(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "DEV_AUTH", False)

    client = TestClient(app)
    response = client.get("/v1/protected-test")
    assert response.status_code == 401
    assert "Invalid or missing authentication" in response.json()["error"]["message"]


def test_dev_auth_header_accepted_when_dev_auth_true(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "DEV_AUTH", True)
    monkeypatch.setattr(settings, "ENV", "development")

    client = TestClient(app)
    response = client.get(
        "/v1/protected-test",
        headers={"X-Dev-User": "test-user-dev"},
    )
    assert response.status_code == 200
    assert "owner_id" in response.json()


def test_bearer_token_authenticated_successfully(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "DEV_AUTH", False)

    token = jwt.encode(
        {"sub": "12345678-1234-5678-1234-567812345678"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    client = TestClient(app)
    response = client.get(
        "/v1/protected-test",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["owner_id"] == "12345678-1234-5678-1234-567812345678"
