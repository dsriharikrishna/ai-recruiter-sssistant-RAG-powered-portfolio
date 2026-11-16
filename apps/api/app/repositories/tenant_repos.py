import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.models import ProfileDraftModel, ProfileVersionModel, Site
from app.repositories.base import BaseTenantRepository


class ProfileDraftRepository(BaseTenantRepository[ProfileDraftModel]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(model=ProfileDraftModel, session=session)

    async def get_latest_draft(self, owner_id: uuid.UUID) -> ProfileDraftModel | None:
        stmt = (
            select(ProfileDraftModel)
            .where(ProfileDraftModel.owner_id == owner_id)
            .order_by(ProfileDraftModel.version.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def save_draft(
        self,
        owner_id: uuid.UUID,
        data: dict[str, Any],
        flags: list[Any] | None = None,
        version: int = 1,
    ) -> ProfileDraftModel:
        return await self.create(
            owner_id=owner_id,
            data=data,
            flags=flags or [],
            version=version,
        )


class ProfileVersionRepository(BaseTenantRepository[ProfileVersionModel]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(model=ProfileVersionModel, session=session)

    async def get_by_version(
        self, owner_id: uuid.UUID, version: int
    ) -> ProfileVersionModel:
        stmt = (
            select(ProfileVersionModel)
            .where(ProfileVersionModel.owner_id == owner_id)
            .where(ProfileVersionModel.version == version)
        )
        result = await self.session.execute(stmt)
        entity = result.scalar_one_or_none()
        if entity is None:
            raise NotFoundError(
                resource="profile_version",
                identifier=f"{owner_id}:{version}",
            )
        return entity


class SiteRepository(BaseTenantRepository[Site]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(model=Site, session=session)

    async def get_by_slug(self, owner_id: uuid.UUID, slug: str) -> Site:
        stmt = select(Site).where(Site.owner_id == owner_id).where(Site.slug == slug)
        result = await self.session.execute(stmt)
        entity = result.scalar_one_or_none()
        if entity is None:
            raise NotFoundError(resource="site", identifier=slug)
        return entity
