import inspect
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import Settings
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import TSVECTOR, JSONB
from pgvector.sqlalchemy import Vector

@compiles(TSVECTOR, "sqlite")
def compile_tsvector_sqlite(type_, compiler, **kw):
    return "TEXT"

@compiles(Vector, "sqlite")
def compile_vector_sqlite(type_, compiler, **kw):
    return "TEXT"

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

from app.core.errors import NotFoundError
from app.models.base import Base
from app.models.models import User
from app.repositories.base import BaseTenantRepository
from app.repositories.tenant_repos import (
    ProfileDraftRepository,
    ProfileVersionRepository,
    SiteRepository,
)


@pytest_asyncio.fixture
async def async_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        # Create tables for repository tests
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_tenant_isolation_two_owners(async_session: AsyncSession) -> None:
    owner_a = uuid.uuid4()
    owner_b = uuid.uuid4()

    # Create user accounts
    user_a = User(
        id=owner_a,
        email="a@example.com",
        hashed_password="pw",
        is_active=True,
    )
    user_b = User(
        id=owner_b,
        email="b@example.com",
        hashed_password="pw",
        is_active=True,
    )
    async_session.add_all([user_a, user_b])
    await async_session.flush()

    repo = SiteRepository(async_session)

    # Owner A creates a site
    site_a = await repo.create(
        owner_id=owner_a,
        slug="site-a",
        template="default",
        theme="light",
    )
    assert site_a.owner_id == owner_a
    assert site_a.slug == "site-a"

    # 1. Owner B cannot read Owner A's site by ID
    with pytest.raises(NotFoundError):
        await repo.get_by_id(owner_id=owner_b, entity_id=site_a.id)

    # 2. Owner B cannot read Owner A's site by slug
    with pytest.raises(NotFoundError):
        await repo.get_by_slug(owner_id=owner_b, slug="site-a")

    # 3. Owner B's list_all does not return Owner A's site
    b_sites = await repo.list_all(owner_id=owner_b)
    assert len(b_sites) == 0

    # 4. Owner B cannot update Owner A's site
    with pytest.raises(NotFoundError):
        await repo.update(owner_id=owner_b, entity_id=site_a.id, theme="dark")

    # 5. Owner B cannot delete Owner A's site
    with pytest.raises(NotFoundError):
        await repo.delete(owner_id=owner_b, entity_id=site_a.id)

    # Verify Owner A's site is still intact and unmodified
    reloaded_a = await repo.get_by_id(owner_id=owner_a, entity_id=site_a.id)
    assert reloaded_a.theme == "light"


def test_every_public_repository_method_requires_owner_id() -> None:
    """Introspection test: public repo methods MUST require owner_id."""
    repository_classes = [
        BaseTenantRepository,
        ProfileDraftRepository,
        ProfileVersionRepository,
        SiteRepository,
    ]

    for repo_cls in repository_classes:
        methods = inspect.getmembers(repo_cls, predicate=inspect.isfunction)
        for method_name, func in methods:
            if method_name.startswith("_"):
                continue

            sig = inspect.signature(func)
            params = list(sig.parameters.keys())
            method_params = params[1:] if params and params[0] == "self" else params

            assert "owner_id" in method_params, (
                f"Violation in {repo_cls.__name__}.{method_name}: "
                f"Missing required 'owner_id' parameter! Params: {params}"
            )


def test_production_refuses_dev_auth() -> None:
    with pytest.raises(ValueError) as exc:
        Settings(
            DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/db",
            REDIS_URL="redis://localhost:6379/0",
            JWT_SECRET_KEY="secret",
            OPENAI_API_KEY="sk-123",
            ENV="production",
            DEV_AUTH=True,
        )
    assert "DEV_AUTH cannot be enabled when ENV=production" in str(exc.value)
