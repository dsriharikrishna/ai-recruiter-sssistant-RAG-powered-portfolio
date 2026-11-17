import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def set_tenant_owner_id(session: AsyncSession, owner_id: uuid.UUID) -> None:
    """Sets local PostgreSQL session variable for Row Level Security (RLS)."""
    await session.execute(
        text("SET LOCAL app.owner_id = :owner_id"),
        {"owner_id": str(owner_id)},
    )
