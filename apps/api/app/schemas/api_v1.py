from typing import Any
import uuid
from pydantic import BaseModel, Field

from app.schemas.profile import ApprovedProfile, ProfileDraft


class ResumeUploadResponse(BaseModel):
    message: str = "Resume received and queued for extraction"
    job_id: uuid.UUID
    document_id: uuid.UUID


class JobStatusResponse(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    status: str
    error_code: str | None = None
    timings: dict[str, Any] = Field(default_factory=dict)


class ProfileDraftPatchRequest(BaseModel):
    draft: ProfileDraft


class FollowupQuestionsRequest(BaseModel):
    answers: dict[str, str] = Field(
        ...,
        description="Key-value mapping of target flag ID to user confirmation/answer",
    )


class ProfileApproveResponse(BaseModel):
    message: str = "Profile approved and published"
    version: int
    profile: ApprovedProfile


class ProfileVersionSummary(BaseModel):
    version: int
    approved_at: str
    summary: str


class ProfileVersionsResponse(BaseModel):
    versions: list[ProfileVersionSummary]


class SitePublishRequest(BaseModel):
    slug: str
    template: str = "default"
    theme: str = "light"
    bot_enabled: bool = True


class SiteResponse(BaseModel):
    id: uuid.UUID
    slug: str
    template: str
    theme: str
    published_version: int | None
    bot_enabled: bool
    url: str


class UnansweredQuestionItem(BaseModel):
    id: uuid.UUID
    question: str
    created_at: str


class UnansweredQuestionsResponse(BaseModel):
    questions: list[UnansweredQuestionItem]


class AccountDeleteResponse(BaseModel):
    message: str = "Account and all associated tenant data permanently deleted"


# Public DTOs
class PublicContact(BaseModel):
    email: str | None = None
    phone: str | None = None
    links: list[dict[str, str]] = Field(default_factory=list)


class PublicSiteResponse(BaseModel):
    slug: str
    template: str
    theme: str
    bot_enabled: bool
    name: str
    headline: str
    summary: str
    contact: PublicContact
    experiences: list[dict[str, Any]] = Field(default_factory=list)
    projects: list[dict[str, Any]] = Field(default_factory=list)
    skills: list[dict[str, Any]] = Field(default_factory=list)
    educations: list[dict[str, Any]] = Field(default_factory=list)
    certifications: list[dict[str, Any]] = Field(default_factory=list)


class PublicChatRequest(BaseModel):
    slug: str
    message: str
    conversation_id: uuid.UUID | None = None
