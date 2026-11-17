import re
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator


class FactType(StrEnum):
    work = "work"
    personal_project = "personal_project"
    learning = "learning"
    certification = "certification"
    listed_only = "listed_only"


class FactSource(StrEnum):
    resume = "resume"
    portfolio = "portfolio"
    user = "user"


class FlagKind(StrEnum):
    needs_confirmation = "needs_confirmation"
    conflict = "conflict"


DATE_REGEX = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def validate_date_format(v: str | None) -> str | None:
    if v is not None and not DATE_REGEX.match(v):
        raise ValueError("Date must be in 'YYYY-MM' format")
    return v


def validate_date_range(start: str | None, end: str | None) -> None:
    if start and end and end < start:
        raise ValueError(f"End date '{end}' must not be before start date '{start}'")


class BaseFact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Annotated[str, Field(min_length=1, max_length=64)]
    type: FactType
    source: FactSource
    evidence: Annotated[str, Field(min_length=1, max_length=2000)] | None = None

    @model_validator(mode="after")
    def check_evidence_requirement(self) -> "BaseFact":
        if self.source != FactSource.user:
            if not self.evidence or not self.evidence.strip():
                msg = (
                    f"Evidence text quote is required when source is "
                    f"'{self.source.value}'"
                )
                raise ValueError(msg)
        return self


class Profile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Annotated[str, Field(min_length=1, max_length=120)]
    headline: Annotated[str, Field(min_length=1, max_length=200)]
    summary: Annotated[str, Field(min_length=1, max_length=3000)]


class ContactLink(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: Annotated[str, Field(min_length=1, max_length=50)]
    url: Annotated[str, Field(min_length=1, max_length=500)]
    is_public: bool = True


class Contact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: Annotated[str, Field(max_length=255)] | None = None
    email_public: bool = True
    phone: Annotated[str, Field(max_length=30)] | None = None
    phone_public: bool = False
    links: list[ContactLink] = Field(default_factory=list)


class Experience(BaseFact):
    company: Annotated[str, Field(min_length=1, max_length=120)]
    role: Annotated[str, Field(min_length=1, max_length=120)]
    start_date: Annotated[str, Field(min_length=7, max_length=7)]
    end_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None
    description: Annotated[str, Field(min_length=1, max_length=4000)]
    highlights: list[Annotated[str, Field(min_length=1, max_length=1000)]] = Field(
        default_factory=list
    )

    @model_validator(mode="after")
    def validate_dates(self) -> "Experience":
        validate_date_format(self.start_date)
        validate_date_format(self.end_date)
        validate_date_range(self.start_date, self.end_date)
        return self


class Project(BaseFact):
    name: Annotated[str, Field(min_length=1, max_length=120)]
    description: Annotated[str, Field(min_length=1, max_length=3000)]
    url: Annotated[str, Field(max_length=500)] | None = None
    technologies: list[Annotated[str, Field(min_length=1, max_length=50)]] = Field(
        default_factory=list
    )
    start_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None
    end_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "Project":
        validate_date_format(self.start_date)
        validate_date_format(self.end_date)
        validate_date_range(self.start_date, self.end_date)
        return self


class Skill(BaseFact):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    category: Annotated[str, Field(max_length=50)] | None = None
    level: Annotated[str, Field(max_length=50)] | None = None


class Education(BaseFact):
    institution: Annotated[str, Field(min_length=1, max_length=150)]
    degree: Annotated[str, Field(min_length=1, max_length=150)]
    field_of_study: Annotated[str, Field(max_length=150)] | None = None
    start_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None
    end_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "Education":
        validate_date_format(self.start_date)
        validate_date_format(self.end_date)
        validate_date_range(self.start_date, self.end_date)
        return self


class Certification(BaseFact):
    name: Annotated[str, Field(min_length=1, max_length=150)]
    issuer: Annotated[str, Field(min_length=1, max_length=150)]
    issue_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None
    expiration_date: Annotated[str, Field(min_length=7, max_length=7)] | None = None
    url: Annotated[str, Field(max_length=500)] | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "Certification":
        validate_date_format(self.issue_date)
        validate_date_format(self.expiration_date)
        validate_date_range(self.issue_date, self.expiration_date)
        return self


class BotSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    salary_policy: Annotated[str, Field(min_length=1, max_length=500)] = (
        "Discuss directly with candidate"
    )
    availability_policy: Annotated[str, Field(min_length=1, max_length=500)] = (
        "Available with 2 weeks notice"
    )
    tone: Annotated[str, Field(min_length=1, max_length=100)] = (
        "professional and concise"
    )
    resume_downloadable: bool = False


class Flag(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: FlagKind
    target_id: Annotated[str, Field(min_length=1, max_length=64)]
    message: Annotated[str, Field(min_length=1, max_length=500)]


def _validate_unique_ids(
    experiences: list[Experience],
    projects: list[Project],
    skills: list[Skill],
    educations: list[Education],
    certifications: list[Certification],
) -> None:
    all_ids: list[str] = []
    for section in (experiences, projects, skills, educations, certifications):
        for item in section:
            all_ids.append(item.id)

    duplicates = {i for i in all_ids if all_ids.count(i) > 1}
    if duplicates:
        raise ValueError(f"Duplicate IDs detected across profile facts: {duplicates}")


class ApprovedProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Annotated[str, Field(min_length=1, max_length=20)] = "1.0.0"
    profile: Profile
    contact: Contact
    experiences: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    educations: list[Education] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    bot_settings: BotSettings = Field(default_factory=BotSettings)

    @model_validator(mode="after")
    def validate_unique_fact_ids(self) -> "ApprovedProfile":
        _validate_unique_ids(
            self.experiences,
            self.projects,
            self.skills,
            self.educations,
            self.certifications,
        )
        return self


class ProfileDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Annotated[str, Field(min_length=1, max_length=20)] = "1.0.0"
    profile: Profile
    contact: Contact
    experiences: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    educations: list[Education] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    bot_settings: BotSettings = Field(default_factory=BotSettings)
    flags: list[Flag] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_unique_fact_ids(self) -> "ProfileDraft":
        _validate_unique_ids(
            self.experiences,
            self.projects,
            self.skills,
            self.educations,
            self.certifications,
        )
        return self
