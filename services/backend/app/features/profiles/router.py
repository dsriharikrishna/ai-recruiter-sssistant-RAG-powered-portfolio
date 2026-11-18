import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_owner
from app.db.rls import set_tenant_owner_id
from app.db.session import get_db_session
from app.features.resumes.router import ensure_tenant_user_exists
from app.models.models import ProfileDraftModel, ProfileVersionModel, Site
from app.schemas.api_v1 import (
    ProfileApproveResponse,
    ProfileDraftPatchRequest,
    ProfileVersionsResponse,
    ProfileVersionSummary,
)
from app.schemas.profile import ApprovedProfile, ProfileDraft

router = APIRouter(tags=["profiles"])


@router.get(
    "/v1/profile/draft",
    response_model=ProfileDraft,
    summary="Get current persisted profile draft",
)
async def get_profile_draft(
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileDraft:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(select(ProfileDraftModel).where(ProfileDraftModel.owner_id == owner_id))
    draft_record = res.scalar_one_or_none()
    if not draft_record:
        raise HTTPException(
            status_code=404,
            detail="No profile draft found. Please upload a resume first.",
        )

    return ProfileDraft(**draft_record.data)


@router.patch(
    "/v1/profile/draft",
    response_model=ProfileDraft,
    summary="Update persisted profile draft",
)
async def patch_profile_draft(
    request: ProfileDraftPatchRequest,
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileDraft:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(select(ProfileDraftModel).where(ProfileDraftModel.owner_id == owner_id))
    draft_record = res.scalar_one_or_none()
    if not draft_record:
        raise HTTPException(status_code=404, detail="Draft not found to update")

    draft_record.data = request.draft.model_dump()
    draft_record.flags = [f.model_dump() for f in request.draft.flags]
    await session.commit()

    return request.draft


@router.post(
    "/v1/profile/followups",
    response_model=ProfileDraft,
    summary="Submit answers to clarifying flags",
)
async def answer_followups(
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileDraft:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(select(ProfileDraftModel).where(ProfileDraftModel.owner_id == owner_id))
    draft_record = res.scalar_one_or_none()
    if not draft_record:
        raise HTTPException(status_code=404, detail="Draft not found")
    draft = ProfileDraft(**draft_record.data)
    draft.flags = []
    draft_record.flags = []
    await session.commit()
    return draft


@router.get(
    "/v1/profile/versions",
    response_model=ProfileVersionsResponse,
    summary="List approved profile versions",
)
async def list_profile_versions(
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileVersionsResponse:
    await set_tenant_owner_id(session, owner_id)
    res = await session.execute(
        select(ProfileVersionModel)
        .where(ProfileVersionModel.owner_id == owner_id)
        .order_by(ProfileVersionModel.version.desc())
    )
    versions = res.scalars().all()
    return ProfileVersionsResponse(
        versions=[
            ProfileVersionSummary(
                version=v.version,
                created_at=v.created_at.isoformat() if v.created_at else None,
                summary=v.approved.get("profile", {}).get("summary", ""),
            )
            for v in versions
        ]
    )


@router.post(
    "/v1/profile/approve",
    response_model=ProfileApproveResponse,
    summary="Approve profile draft and publish to site",
)
async def approve_profile(
    owner_id: uuid.UUID = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileApproveResponse:
    await set_tenant_owner_id(session, owner_id)
    await ensure_tenant_user_exists(session, owner_id)

    res = await session.execute(select(ProfileDraftModel).where(ProfileDraftModel.owner_id == owner_id))
    draft_record = res.scalar_one_or_none()
    if not draft_record:
        raise HTTPException(status_code=400, detail="Cannot approve: no draft exists for tenant")

    # 1. Convert to ApprovedProfile (strip draft flags before converting)
    draft_dict = dict(draft_record.data)
    draft_dict.pop("flags", None)
    approved_profile = ApprovedProfile(**draft_dict)

    # 2. Save new ProfileVersionModel
    version_res = await session.execute(
        select(ProfileVersionModel)
        .where(ProfileVersionModel.owner_id == owner_id)
        .order_by(ProfileVersionModel.version.desc())
    )
    latest_v = version_res.scalars().first()
    new_version_num = (latest_v.version + 1) if latest_v else 1

    profile_version = ProfileVersionModel(
        id=uuid.uuid4(),
        owner_id=owner_id,
        version=new_version_num,
        approved=approved_profile.model_dump(),
        extraction_diff={},
    )
    session.add(profile_version)

    # 3. Auto create/update Site record
    slug = approved_profile.profile.name.lower().replace(" ", "-").replace(".", "").replace("'", "")
    if not slug:
        slug = f"user-{str(owner_id)[:8]}"

    site_res = await session.execute(select(Site).where(Site.owner_id == owner_id))
    site = site_res.scalar_one_or_none()

    if site:
        site.slug = slug
        site.published_version = new_version_num
    else:
        site = Site(
            id=uuid.uuid4(),
            owner_id=owner_id,
            slug=slug,
            template="default",
            theme="dark",
            published_version=new_version_num,
            bot_enabled=True,
        )
        session.add(site)

    await session.commit()

    return ProfileApproveResponse(
        version=new_version_num,
        profile=approved_profile,
        message=f"Profile approved, indexed, and site published at /{slug}",
    )
