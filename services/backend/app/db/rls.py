import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def set_tenant_owner_id(session: AsyncSession, owner_id: uuid.UUID) -> None:
    """Sets local PostgreSQL session variable for Row Level Security (RLS)."""
    # PostgreSQL SET does not accept parameter binding in standard SQL;
    # set_config() is the safe, injection-proof PostgreSQL function for this.
    await session.execute(
        text("SELECT set_config('app.owner_id', :owner_id, true)"),
        {"owner_id": str(owner_id)},
    )
