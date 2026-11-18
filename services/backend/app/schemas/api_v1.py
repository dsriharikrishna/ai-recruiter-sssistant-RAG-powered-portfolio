import uuid
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.profile import (
    ApprovedProfile,
    Certification,
    Education,
    Experience,
    ProfileDraft,
    Project,
    Skill,
)


class ResumeUploadResponse(BaseModel):
    message: str = "Resume received and queued for extraction"
    job_id: uuid.UUID
    document_id: uuid.UUID


class JobStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    errors: list[str] = Field(default_factory=list)
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
    created_at: str | None = None
    summary: str = ""


class ProfileVersionsResponse(BaseModel):
    versions: list[ProfileVersionSummary]


class SitePublishRequest(BaseModel):
    slug: str | None = None
    template: str | None = "default"
    theme: str | None = "light"
    bot_enabled: bool | None = True


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


# Public Portfolio DTOs
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
    experiences: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    educations: list[Education] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)


class PublicChatRequest(BaseModel):
    slug: str
    message: str
    conversation_id: uuid.UUID | None = None


# Recruiter Chat Streaming Models
class ChatSourceItem(BaseModel):
    entity_id: str
    title: str


class ChatEvent(BaseModel):
    event: str
    data: dict[str, Any] = Field(default_factory=dict)


class ChatMessageHistory(BaseModel):
    role: str
    content: str
