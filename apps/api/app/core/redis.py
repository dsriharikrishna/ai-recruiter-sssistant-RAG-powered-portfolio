from collections.abc import AsyncGenerator

import redis.asyncio as aioredis

from app.core.config import get_settings

_redis_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def get_redis_client() -> AsyncGenerator[aioredis.Redis, None]:
    client = get_redis()
    yield client
