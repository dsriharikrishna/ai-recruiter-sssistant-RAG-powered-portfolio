from typing import Any

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis_client
from app.db.session import get_db_session

router = APIRouter(tags=["health"])


@router.get("/ready")
async def readiness_check(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
    redis: aioredis.Redis = Depends(get_redis_client),  # noqa: B008
) -> JSONResponse:
    checks: dict[str, Any] = {"database": "error", "redis": "error"}
    all_ok = True

    # Database check
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        all_ok = False
        checks["database"] = "error"

    # Redis check
    try:
        ping = await redis.ping()
        if ping:
            checks["redis"] = "ok"
        else:
            all_ok = False
            checks["redis"] = "error"
    except Exception:
        all_ok = False
        checks["redis"] = "error"

    status_code = status.HTTP_200_OK if all_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    overall_status = "ok" if all_ok else "unhealthy"

    return JSONResponse(
        status_code=status_code,
        content={"status": overall_status, "checks": checks},
    )
