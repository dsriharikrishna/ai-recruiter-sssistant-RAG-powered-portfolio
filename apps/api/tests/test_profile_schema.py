import pytest
from pydantic import ValidationError

from app.schemas.profile import (
    ApprovedProfile,
    BotSettings,
    Certification,
    Contact,
    ContactLink,
    Education,
    Experience,
    FactSource,
    FactType,
    Flag,
    FlagKind,
    Profile,
    ProfileDraft,
    Project,
    Skill,
)


def sample_profile() -> Profile:
    return Profile(
        name="Jane Doe",
        headline="Senior Full Stack Engineer",
        summary="Experienced software engineer specializing in Python and Next.js.",
    )


def sample_contact() -> Contact:
    return Contact(
        email="jane.doe@example.com",
        email_public=True,
        phone="+1234567890",
        phone_public=False,
        links=[
            ContactLink(
                label="GitHub",
                url="https://github.com/janedoe",
                is_public=True,
            ),
            ContactLink(
                label="LinkedIn",
                url="https://linkedin.com/in/janedoe",
                is_public=True,
            ),
        ],
    )


def test_valid_approved_profile() -> None:
    profile = sample_profile()
    contact = sample_contact()

    exp = Experience(
        id="exp-1",
        type=FactType.work,
        source=FactSource.resume,
        evidence="Senior Engineer at Acme Corp from 2021 to 2024",
        company="Acme Corp",
        role="Senior Engineer",
        start_date="2021-01",
        end_date="2024-03",
        description="Built scalable microservices and APIs.",
        highlights=["Reduced latency by 40%"],
    )

    proj = Project(
        id="proj-1",
        type=FactType.personal_project,
        source=FactSource.portfolio,
        evidence="Built RAG-based recruiter chatbot with Next.js and FastAPI",
        name="Portfolio Builder",
        description="Multi-tenant portfolio builder with RAG recruiter chatbot.",
        technologies=["FastAPI", "Next.js", "pgvector"],
        start_date="2024-01",
    )

    skill = Skill(
        id="skill-1",
        type=FactType.learning,
        source=FactSource.user,
        name="Python",
        category="Languages",
        level="Advanced",
    )

    edu = Education(
        id="edu-1",
        type=FactType.learning,
        source=FactSource.resume,
        evidence="B.S. in Computer Science, Tech University, 2016-2020",
        institution="Tech University",
        degree="B.S.",
        field_of_study="Computer Science",
        start_date="2016-09",
        end_date="2020-05",
    )

    cert = Certification(
        id="cert-1",
        type=FactType.certification,
        source=FactSource.resume,
        evidence="AWS Certified Solutions Architect, issued 2023-05",
        name="AWS Certified Solutions Architect",
        issuer="Amazon Web Services",
        issue_date="2023-05",
    )

    approved = ApprovedProfile(
        profile=profile,
        contact=contact,
        experiences=[exp],
        projects=[proj],
        skills=[skill],
        educations=[edu],
        certifications=[cert],
        bot_settings=BotSettings(
            salary_policy="150k - 180k USD",
            availability_policy="Immediate",
            tone="confident and concise",
            resume_downloadable=True,
        ),
    )

    assert approved.profile.name == "Jane Doe"
    assert approved.experiences[0].company == "Acme Corp"
    assert approved.skills[0].name == "Python"
    assert approved.schema_version == "1.0.0"


def test_evidence_required_for_non_user_source() -> None:
    # resume source without evidence must raise ValidationError
    with pytest.raises(ValidationError) as exc:
        Experience(
            id="exp-1",
            type=FactType.work,
            source=FactSource.resume,
            evidence=None,  # missing required evidence
            company="Acme Corp",
            role="Engineer",
            start_date="2020-01",
            description="Software development",
        )
    assert "Evidence text quote is required" in str(exc.value)


def test_user_source_allows_no_evidence() -> None:
    skill = Skill(
        id="skill-user-1",
        type=FactType.work,
        source=FactSource.user,
        evidence=None,
        name="PostgreSQL",
    )
    assert skill.source == FactSource.user
    assert skill.evidence is None


def test_invalid_date_format_raises_error() -> None:
    with pytest.raises(ValidationError):
        Experience(
            id="exp-bad-date",
            type=FactType.work,
            source=FactSource.user,
            company="Acme",
            role="Engineer",
            start_date="2022/01",  # Invalid separator
            description="Testing dates",
        )


def test_end_date_before_start_date_raises_error() -> None:
    with pytest.raises(ValidationError) as exc:
        Experience(
            id="exp-inverted-date",
            type=FactType.work,
            source=FactSource.user,
            company="Acme",
            role="Engineer",
            start_date="2023-05",
            end_date="2022-04",  # Prior to start
            description="Testing inverted dates",
        )
    assert "must not be before start date" in str(exc.value)


def test_duplicate_fact_ids_raises_error() -> None:
    profile = sample_profile()
    contact = sample_contact()

    exp = Experience(
        id="duplicate-id-1",
        type=FactType.work,
        source=FactSource.user,
        company="Acme",
        role="Engineer",
        start_date="2021-01",
        description="Testing duplicate ids",
    )

    skill = Skill(
        id="duplicate-id-1",  # Identical ID
        type=FactType.listed_only,
        source=FactSource.user,
        name="Docker",
    )

    with pytest.raises(ValidationError) as exc:
        ApprovedProfile(
            profile=profile,
            contact=contact,
            experiences=[exp],
            skills=[skill],
        )
    assert "Duplicate IDs detected" in str(exc.value)


def test_profile_draft_with_flags() -> None:
    profile = sample_profile()
    contact = sample_contact()

    flag1 = Flag(
        kind=FlagKind.needs_confirmation,
        target_id="exp-1",
        message="Please confirm end date at Acme Corp",
    )
    flag2 = Flag(
        kind=FlagKind.conflict,
        target_id="exp-1",
        message="Portfolio has Staff Engineer, resume has Senior Engineer",
    )

    draft = ProfileDraft(
        profile=profile,
        contact=contact,
        flags=[flag1, flag2],
    )
    assert len(draft.flags) == 2
    assert draft.flags[0].kind == FlagKind.needs_confirmation
    assert draft.flags[1].kind == FlagKind.conflict
