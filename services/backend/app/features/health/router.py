from enum import StrEnum

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis_client
from app.db.session import get_db_session

router = APIRouter(tags=["health"])


class ComponentStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class HealthCheckDetails(BaseModel):
    database: ComponentStatus
    redis: ComponentStatus


class ReadyResponse(BaseModel):
    status: str
    checks: HealthCheckDetails


class HealthResponse(BaseModel):
    status: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/ready", response_model=ReadyResponse)
async def readiness_check(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
    redis: aioredis.Redis = Depends(get_redis_client),  # noqa: B008
) -> JSONResponse:
    db_status = ComponentStatus.ERROR
    redis_status = ComponentStatus.ERROR
    all_ok = True

    try:
        await db.execute(text("SELECT 1"))
        db_status = ComponentStatus.OK
    except Exception:
        all_ok = False

    try:
        ping = await redis.ping()
        if ping:
            redis_status = ComponentStatus.OK
        else:
            all_ok = False
    except Exception:
        all_ok = False

    status_code = status.HTTP_200_OK if all_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    overall_status = "ok" if all_ok else "unhealthy"

    response_model = ReadyResponse(
        status=overall_status,
        checks=HealthCheckDetails(database=db_status, redis=redis_status),
    )

    return JSONResponse(
        status_code=status_code,
        content=response_model.model_dump(),
    )
