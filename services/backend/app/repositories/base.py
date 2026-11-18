import uuid
from typing import Any

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.base import Base


class BaseTenantRepository[ModelType: Base]:
    """Base repository class where EVERY method requires owner_id and filters by it."""

    def __init__(self, model: type[ModelType], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    async def get_by_id(self, owner_id: uuid.UUID, entity_id: uuid.UUID) -> ModelType:
        stmt = (
            select(self.model)
            .where(self.model.owner_id == owner_id)  # type: ignore[attr-defined]
            .where(self.model.id == entity_id)  # type: ignore[attr-defined]
        )
        result = await self.session.execute(stmt)
        entity = result.scalar_one_or_none()
        if entity is None:
            raise NotFoundError(
                resource=self.model.__tablename__,
                identifier=str(entity_id),
            )
        return entity

    async def list_all(self, owner_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[ModelType]:
        stmt = (
            select(self.model)
            .where(self.model.owner_id == owner_id)  # type: ignore[attr-defined]
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, owner_id: uuid.UUID, **kwargs: Any) -> ModelType:
        # Guarantee owner_id is passed and matches tenant
        kwargs["owner_id"] = owner_id
        entity = self.model(**kwargs)
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def update(self, owner_id: uuid.UUID, entity_id: uuid.UUID, **kwargs: Any) -> ModelType:
        # Verify entity exists and belongs to owner
        await self.get_by_id(owner_id=owner_id, entity_id=entity_id)

        # Disallow updating owner_id or id
        kwargs.pop("owner_id", None)
        kwargs.pop("id", None)

        stmt = (
            update(self.model)
            .where(self.model.owner_id == owner_id)  # type: ignore[attr-defined]
            .where(self.model.id == entity_id)  # type: ignore[attr-defined]
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await self.session.execute(stmt)
        await self.session.flush()
        return await self.get_by_id(owner_id=owner_id, entity_id=entity_id)

    async def delete(self, owner_id: uuid.UUID, entity_id: uuid.UUID) -> None:
        # Verify entity exists and belongs to owner
        await self.get_by_id(owner_id=owner_id, entity_id=entity_id)

        stmt = (
            delete(self.model)
            .where(self.model.owner_id == owner_id)  # type: ignore[attr-defined]
            .where(self.model.id == entity_id)  # type: ignore[attr-defined]
        )
        await self.session.execute(stmt)
        await self.session.flush()
