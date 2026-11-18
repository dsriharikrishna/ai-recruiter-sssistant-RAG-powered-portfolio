import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_owner
from app.db.rls import set_tenant_owner_id
from app.db.session import get_db_session
from app.models.models import ProfileVersionModel, Site, User
from app.schemas.api_v1 import (
    AccountDeleteResponse,
    PublicContact,
    PublicSiteResponse,
    SitePublishRequest,
    SiteResponse,
    UnansweredQuestionsResponse,
)
from app.schemas.profile import ApprovedProfile

router = APIRouter(tags=["sites"])


@router.get(
    "/v1/site",
    response_model=SiteResponse,
    summary="Get tenant's published site configuration",
)
async def get_site(
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> SiteResponse:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(select(Site).where(Site.owner_id == owner_id))
    site = res.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=404,
            detail="No site configured yet. Approve a profile to publish.",
        )

    return SiteResponse(
        id=site.id,
        slug=site.slug,
        template=site.template,
        theme=site.theme,
        published_version=site.published_version or 1,
        bot_enabled=site.bot_enabled,
        url=f"http://localhost:3000/{site.slug}",
    )


@router.post(
    "/v1/site/publish",
    response_model=SiteResponse,
    summary="Publish or update site template/theme",
)
async def publish_site(
    request: SitePublishRequest,
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> SiteResponse:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(select(Site).where(Site.owner_id == owner_id))
    site = res.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    if request.template:
        site.template = request.template
    if request.theme:
        site.theme = request.theme
    await session.commit()

    return SiteResponse(
        id=site.id,
        slug=site.slug,
        template=site.template,
        theme=site.theme,
        published_version=site.published_version or 1,
        bot_enabled=site.bot_enabled,
        url=f"http://localhost:3000/{site.slug}",
    )


@router.get(
    "/v1/unanswered",
    response_model=UnansweredQuestionsResponse,
    summary="Get list of unanswered recruiter questions",
)
async def get_unanswered_questions(
    owner_id: uuid.UUID = Depends(get_current_owner),
) -> UnansweredQuestionsResponse:
    return UnansweredQuestionsResponse(questions=[])


@router.delete(
    "/v1/account",
    response_model=AccountDeleteResponse,
    summary="Delete tenant account and all user data",
)
async def delete_account(
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> AccountDeleteResponse:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(select(User).where(User.id == owner_id))
    user = res.scalar_one_or_none()
    if user:
        await session.delete(user)
        await session.commit()
    return AccountDeleteResponse()


@router.get(
    "/public/sites/{slug}",
    response_model=PublicSiteResponse,
    summary="Fetch real public portfolio data for site slug from database",
)
async def get_public_site(
    slug: str,
    session: AsyncSession = Depends(get_db_session),
) -> PublicSiteResponse:
    # 1. Lookup site by slug in postgres
    site_res = await session.execute(select(Site).where(Site.slug == slug))
    site = site_res.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=404, detail=f"Public portfolio '/{slug}' was not found"
        )

    # 2. Get the approved version for this site
    ver_res = await session.execute(
        select(ProfileVersionModel).where(
            ProfileVersionModel.owner_id == site.owner_id,
            ProfileVersionModel.version == site.published_version,
        )
    )
    version_record = ver_res.scalar_one_or_none()
    if not version_record:
        raise HTTPException(
            status_code=404, detail="Published profile version not found"
        )

    approved = ApprovedProfile(**version_record.approved)

    return PublicSiteResponse(
        slug=site.slug,
        template=site.template,
        theme=site.theme,
        bot_enabled=site.bot_enabled,
        name=approved.profile.name,
        headline=approved.profile.headline,
        summary=approved.profile.summary,
        contact=PublicContact(
            email=approved.contact.email if approved.contact.email_public else None,
            phone=approved.contact.phone if approved.contact.phone_public else None,
            links=[
                {"label": l.label, "url": l.url}
                for l in approved.contact.links
                if l.is_public
            ],
        ),
        experiences=approved.experiences,
        projects=approved.projects,
        skills=approved.skills,
        educations=approved.educations,
        certifications=approved.certifications,
    )
