import asyncio
import json
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sse_starlette.sse import EventSourceResponse

from app.api.v1.mock_data import get_mock_approved_profile, get_mock_profile_draft
from app.core.security import get_current_owner
from app.schemas.api_v1 import (
    AccountDeleteResponse,
    FollowupQuestionsRequest,
    JobStatusResponse,
    ProfileApproveResponse,
    ProfileDraftPatchRequest,
    ProfileVersionsResponse,
    ProfileVersionSummary,
    PublicChatRequest,
    PublicContact,
    PublicSiteResponse,
    ResumeUploadResponse,
    SitePublishRequest,
    SiteResponse,
    UnansweredQuestionItem,
    UnansweredQuestionsResponse,
)
from app.schemas.profile import ApprovedProfile, ProfileDraft

router = APIRouter()


# ==========================================
# Authenticated Routes (under /v1)
# ==========================================


@router.post(
    "/v1/resumes",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload resume for extraction",
)
async def upload_resume(
    file: UploadFile = File(...),  # noqa: B008
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> ResumeUploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")
    return ResumeUploadResponse(
        job_id=uuid.uuid4(),
        document_id=uuid.uuid4(),
    )


@router.get(
    "/v1/jobs/{job_id}",
    response_model=JobStatusResponse,
    summary="Get status of an extraction job",
)
async def get_job_status(
    job_id: uuid.UUID,
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> JobStatusResponse:
    return JobStatusResponse(
        id=job_id,
        document_id=uuid.uuid4(),
        status="completed",
        error_code=None,
        timings={"pdf_parse_ms": 120, "llm_extract_ms": 1450, "total_ms": 1570},
    )


@router.get(
    "/v1/profile/draft",
    response_model=ProfileDraft,
    summary="Get current profile draft",
)
async def get_profile_draft(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> ProfileDraft:
    return get_mock_profile_draft()


@router.patch(
    "/v1/profile/draft",
    response_model=ProfileDraft,
    summary="Update profile draft",
)
async def patch_profile_draft(
    request: ProfileDraftPatchRequest,
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> ProfileDraft:
    return request.draft


@router.post(
    "/v1/profile/followups",
    response_model=ProfileDraft,
    summary="Submit answers to clarifying flags",
)
async def answer_followups(
    request: FollowupQuestionsRequest,
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> ProfileDraft:
    draft = get_mock_profile_draft()
    draft.flags = []
    return draft


@router.post(
    "/v1/profile/approve",
    response_model=ProfileApproveResponse,
    summary="Approve profile draft as active version",
)
async def approve_profile(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> ProfileApproveResponse:
    profile = get_mock_approved_profile()
    return ProfileApproveResponse(
        version=1,
        profile=profile,
    )


@router.get(
    "/v1/profile/versions",
    response_model=ProfileVersionsResponse,
    summary="List all approved profile versions",
)
async def list_profile_versions(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> ProfileVersionsResponse:
    return ProfileVersionsResponse(
        versions=[
            ProfileVersionSummary(
                version=1,
                approved_at="2026-11-16T10:00:00Z",
                summary="Initial approved candidate profile",
            )
        ]
    )


@router.post(
    "/v1/site/publish",
    response_model=SiteResponse,
    summary="Publish portfolio site configuration",
)
async def publish_site(
    request: SitePublishRequest,
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> SiteResponse:
    return SiteResponse(
        id=uuid.uuid4(),
        slug=request.slug,
        template=request.template,
        theme=request.theme,
        published_version=1,
        bot_enabled=request.bot_enabled,
        url=f"https://portfolio.domain/{request.slug}",
    )


@router.get(
    "/v1/site",
    response_model=SiteResponse,
    summary="Get user's published portfolio site info",
)
async def get_site(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> SiteResponse:
    return SiteResponse(
        id=uuid.uuid4(),
        slug="alex-johnson",
        template="default",
        theme="light",
        published_version=1,
        bot_enabled=True,
        url="https://portfolio.domain/alex-johnson",
    )


@router.get(
    "/v1/unanswered",
    response_model=UnansweredQuestionsResponse,
    summary="Get list of unanswered recruiter questions",
)
async def get_unanswered_questions(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> UnansweredQuestionsResponse:
    return UnansweredQuestionsResponse(
        questions=[
            UnansweredQuestionItem(
                id=uuid.uuid4(),
                question="Experience with Kubernetes service meshes?",
                created_at="2026-11-16T10:30:00Z",
            )
        ]
    )


@router.delete(
    "/v1/account",
    response_model=AccountDeleteResponse,
    summary="Delete tenant account and all user data",
)
async def delete_account(
    owner_id: uuid.UUID = Depends(get_current_owner),  # noqa: B008
) -> AccountDeleteResponse:
    return AccountDeleteResponse()


# ==========================================
# Public Routes (under /public)
# ==========================================


@router.get(
    "/public/sites/{slug}",
    response_model=PublicSiteResponse,
    summary="Fetch public portfolio data for site slug",
)
async def get_public_site(slug: str) -> PublicSiteResponse:
    mock_profile: ApprovedProfile = get_mock_approved_profile()
    return PublicSiteResponse(
        slug=slug,
        template="default",
        theme="light",
        bot_enabled=True,
        name=mock_profile.profile.name,
        headline=mock_profile.profile.headline,
        summary=mock_profile.profile.summary,
        contact=PublicContact(
            email=mock_profile.contact.email
            if mock_profile.contact.email_public
            else None,
            phone=mock_profile.contact.phone
            if mock_profile.contact.phone_public
            else None,
            links=[
                {"label": link.label, "url": link.url}
                for link in mock_profile.contact.links
                if link.is_public
            ],
        ),
        experiences=[exp.model_dump() for exp in mock_profile.experiences],
        projects=[proj.model_dump() for proj in mock_profile.projects],
        skills=[skill.model_dump() for skill in mock_profile.skills],
        educations=[edu.model_dump() for edu in mock_profile.educations],
        certifications=[cert.model_dump() for cert in mock_profile.certifications],
    )


@router.post(
    "/public/chat/stream",
    summary="Stream recruiter chatbot response via Server-Sent Events",
)
async def public_chat_stream(request: PublicChatRequest) -> EventSourceResponse:
    answer_text = (
        "Alex has extensive experience leading distributed cloud platform projects "
        "and implementing PostgreSQL & pgvector systems with high availability."
    )
    words = answer_text.split()

    async def event_generator() -> AsyncGenerator[dict[str, Any], None]:
        # 1. Sources event
        sources = [
            {"id": "exp-1", "title": "Staff Infrastructure Engineer at Acme Cloud"}
        ]
        yield {"event": "sources", "data": json.dumps(sources)}
        await asyncio.sleep(0.01)

        # 2. Token events
        for word in words:
            yield {"event": "token", "data": json.dumps({"token": f"{word} "})}
            await asyncio.sleep(0.01)

        # 3. Done event
        yield {"event": "done", "data": json.dumps({"done": True})}

    return EventSourceResponse(event_generator())
