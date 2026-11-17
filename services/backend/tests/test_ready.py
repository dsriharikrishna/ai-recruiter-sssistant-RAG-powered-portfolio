from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis_client
from app.db.session import get_db_session
from app.main import app


@pytest.mark.asyncio
async def test_ready_endpoint_healthy() -> None:
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock()

    mock_redis = AsyncMock()
    mock_redis.ping = AsyncMock(return_value=True)

    async def override_get_db_session() -> AsyncGenerator[AsyncMock, None]:
        yield mock_db

    async def override_get_redis_client() -> AsyncGenerator[AsyncMock, None]:
        yield mock_redis

    app.dependency_overrides[get_db_session] = override_get_db_session
    app.dependency_overrides[get_redis_client] = override_get_redis_client

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/ready")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["checks"]["database"] == "ok"
    assert data["checks"]["redis"] == "ok"


@pytest.mark.asyncio
async def test_ready_endpoint_unhealthy() -> None:
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute = AsyncMock(side_effect=Exception("Database connection timeout"))

    mock_redis = AsyncMock()
    mock_redis.ping = AsyncMock(side_effect=Exception("Redis connection refused"))

    async def override_get_db_session() -> AsyncGenerator[AsyncMock, None]:
        yield mock_db

    async def override_get_redis_client() -> AsyncGenerator[AsyncMock, None]:
        yield mock_redis

    app.dependency_overrides[get_db_session] = override_get_db_session
    app.dependency_overrides[get_redis_client] = override_get_redis_client

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/ready")

    app.dependency_overrides.clear()

    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "unhealthy"
    assert data["checks"]["database"] == "error"
    assert data["checks"]["redis"] == "error"
