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


def get_mock_approved_profile() -> ApprovedProfile:
    return ApprovedProfile(
        schema_version="1.0.0",
        profile=Profile(
            name="Alex Johnson",
            headline="Staff Software Engineer & Distributed Systems Architect",
            summary="10+ years architecting multi-tenant distributed platforms.",
        ),
        contact=Contact(
            email="alex.johnson@example.com",
            email_public=True,
            phone="+14155552671",
            phone_public=False,
            links=[
                ContactLink(label="GitHub", url="https://github.com/alexj"),
                ContactLink(label="LinkedIn", url="https://linkedin.com/in/alexj"),
            ],
        ),
        experiences=[
            Experience(
                id="exp-1",
                type=FactType.work,
                source=FactSource.resume,
                evidence="Staff Infrastructure Engineer at Acme Cloud (2021-2024)",
                company="Acme Cloud",
                role="Staff Infrastructure Engineer",
                start_date="2021-02",
                end_date="2024-05",
                description="Designed high-throughput Kafka and PostgreSQL pipelines.",
                highlights=["Reduced system p99 latency by 45%"],
            )
        ],
        projects=[
            Project(
                id="proj-1",
                type=FactType.personal_project,
                source=FactSource.portfolio,
                evidence="Built distributed vector search database in Rust",
                name="VectorStore-RS",
                description="High-performance vector similarity indexing engine.",
                technologies=["Rust", "pgvector", "RAG"],
            )
        ],
        skills=[
            Skill(
                id="skill-1",
                type=FactType.work,
                source=FactSource.resume,
                evidence="Over 8 years building production Python and Rust services",
                name="Python",
                category="Programming Languages",
                level="Expert",
            ),
            Skill(
                id="skill-2",
                type=FactType.learning,
                source=FactSource.user,
                name="PostgreSQL",
                category="Databases",
                level="Expert",
            ),
        ],
        educations=[
            Education(
                id="edu-1",
                type=FactType.learning,
                source=FactSource.resume,
                evidence="B.S. Computer Science from UC Berkeley 2013-2017",
                institution="UC Berkeley",
                degree="B.S.",
                field_of_study="Computer Science",
                start_date="2013-09",
                end_date="2017-05",
            )
        ],
        certifications=[
            Certification(
                id="cert-1",
                type=FactType.certification,
                source=FactSource.resume,
                evidence="AWS Solutions Architect Professional valid 2026",
                name="AWS Certified Solutions Architect",
                issuer="Amazon Web Services",
                issue_date="2023-04",
            )
        ],
        bot_settings=BotSettings(
            salary_policy="Market rate for Staff Level ($180k-$220k)",
            availability_policy="Available with 30 days notice",
            tone="professional, direct, and technically thorough",
            resume_downloadable=True,
        ),
    )


def get_mock_profile_draft() -> ProfileDraft:
    approved = get_mock_approved_profile()
    return ProfileDraft(
        schema_version="1.0.0",
        profile=approved.profile,
        contact=approved.contact,
        experiences=approved.experiences,
        projects=approved.projects,
        skills=approved.skills,
        educations=approved.educations,
        certifications=approved.certifications,
        bot_settings=approved.bot_settings,
        flags=[
            Flag(
                kind=FlagKind.needs_confirmation,
                target_id="exp-1",
                message="Did your role at Acme Cloud conclude in May 2024?",
            )
        ],
    )
