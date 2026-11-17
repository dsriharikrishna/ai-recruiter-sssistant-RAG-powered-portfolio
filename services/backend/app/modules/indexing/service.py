import uuid
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.profile import ApprovedProfile


class ChunkSpec(BaseModel):
    """Specification of a document chunk ready for embedding and vector storage."""

    entity_id: str | None = None
    section: str
    type: str
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)


def build_summary(profile: ApprovedProfile) -> str:
    """Build a deterministic summary of candidate profile without invoking an LLM.

    Real implementation requirement:
    1. Render a clean, templated text overview of candidate qualifications.
    2. Include name, headline, summary, top skills, and recent experience roles.
    3. Used as contextual header in vector retrieval and public meta tags.

    Stub behavior:
    Returns templated markdown string from the profile model.
    """
    recent_roles = ", ".join(exp.role for exp in profile.experiences[:3])
    top_skills = ", ".join(skill.name for skill in profile.skills[:5])
    return (
        f"# {profile.profile.name} - {profile.profile.headline}\n\n"
        f"Summary: {profile.profile.summary}\n"
        f"Top Skills: {top_skills}\n"
        f"Key Experiences: {recent_roles}\n"
    )


def build_chunks(profile: ApprovedProfile) -> list[ChunkSpec]:
    """Deterministically partition an approved profile into retrieval chunks.

    Real implementation requirement:
    1. No LLM used: 100% deterministic template-driven chunking.
    2. Header for each chunk with candidate name & section for retrieval grounding.
    3. Each chunk maps directly to a discrete profile fact entity (with entity_id).
    4. Computes content and metadata for both vector search and tsvector BM25 search.

    Stub behavior:
    Produces chunk specs for summary, experience, project, skill, education.
    """
    chunks: list[ChunkSpec] = []
    candidate_name = profile.profile.name

    # 1. Summary chunk
    chunks.append(
        ChunkSpec(
            entity_id="summary",
            section="overview",
            type="summary",
            content=(
                f"Candidate: {candidate_name}\n"
                f"Headline: {profile.profile.headline}\n"
                f"Summary: {profile.profile.summary}"
            ),
        )
    )

    # 2. Experience chunks
    for exp in profile.experiences:
        dates = f"{exp.start_date} to {exp.end_date or 'Present'}"
        chunks.append(
            ChunkSpec(
                entity_id=exp.id,
                section="experience",
                type=exp.type.value,
                content=(
                    f"Candidate: {candidate_name} | Experience at {exp.company}\n"
                    f"Role: {exp.role} ({dates})\n"
                    f"Details: {exp.description}\n"
                    f"Highlights: {', '.join(exp.highlights)}"
                ),
            )
        )

    # 3. Project chunks
    for proj in profile.projects:
        chunks.append(
            ChunkSpec(
                entity_id=proj.id,
                section="project",
                type=proj.type.value,
                content=(
                    f"Candidate: {candidate_name} | Project: {proj.name}\n"
                    f"Technologies: {', '.join(proj.technologies)}\n"
                    f"Description: {proj.description}"
                ),
            )
        )

    return chunks


async def index_profile(owner_id: uuid.UUID, version: int) -> None:
    """Index approved candidate profile chunks into pgvector and tsvector store.

    Real implementation requirement:
    1. Load approved profile version from `profile_versions` repository.
    2. Generate deterministic chunks using `build_chunks(profile)`.
    3. Generate embeddings via OpenAI embeddings interface for each chunk.
    4. Compute content hash (SHA256) and tsvector tokens.
    5. Save chunks into PostgreSQL `chunks` table within tenant isolation.

    Stub behavior:
    No-op stub validating function signature and arguments.
    """
    pass
