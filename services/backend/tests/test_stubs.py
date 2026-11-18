import uuid

import pytest

from app.features.chat.indexing import (
    ChunkSpec,
    build_chunks,
    build_summary,
    index_profile,
)
from app.features.chat.service import ChatEvent, Route, answer, route_question
from app.features.resumes.parser import parse_resume_to_draft
from app.features.resumes.service import (
    extract_profile,
    merge_drafts,
    verify_evidence,
)
from app.schemas.profile import ApprovedProfile, FactSource, FlagKind, ProfileDraft

# ==========================================
# Extraction Service Tests
# ==========================================


def test_extract_profile_returns_draft() -> None:
    text = "Jane Doe\nSoftware Engineer at Acme Corp.\nSummary: Building systems."
    draft = extract_profile(text=text, source=FactSource.resume)
    assert isinstance(draft, ProfileDraft)
    assert "Jane Doe" in draft.profile.name
    assert len(draft.experiences) > 0


def test_verify_evidence_flags_missing_quote() -> None:
    source_text = "Acme Cloud - Staff Infrastructure Engineer 2021-2024"
    draft = parse_resume_to_draft(source_text)
    verified = verify_evidence(draft, "Some completely unrelated text with no work history.")
    conflict_flags = [f for f in verified.flags if f.kind == FlagKind.conflict]
    assert len(conflict_flags) > 0


def test_merge_drafts_combines_flags() -> None:
    draft1 = parse_resume_to_draft("Alice Engineer at Acme Cloud 2021-2024")
    draft2 = parse_resume_to_draft("Bob Engineer at Beta Corp 2021-2024")
    merged = merge_drafts(draft1, draft2)
    assert isinstance(merged, ProfileDraft)
    assert len(merged.flags) == len(draft1.flags) + len(draft2.flags)


# ==========================================
# Indexing Service Tests
# ==========================================


def test_build_summary_deterministic() -> None:
    draft = parse_resume_to_draft("Alice Engineer\nSoftware Engineer\nSummary: Expert builder")
    draft_dict = dict(draft.model_dump())
    draft_dict.pop("flags", None)
    profile = ApprovedProfile(**draft_dict)
    summary = build_summary(profile)
    assert isinstance(summary, str)
    assert profile.profile.name in summary
    assert profile.profile.headline in summary


def test_build_chunks_deterministic_specs() -> None:
    draft = parse_resume_to_draft("Alice Engineer\nSoftware Engineer\nSummary: Expert builder")
    draft_dict = dict(draft.model_dump())
    draft_dict.pop("flags", None)
    profile = ApprovedProfile(**draft_dict)
    chunks = build_chunks(profile)
    assert isinstance(chunks, list)
    assert len(chunks) > 0
    for chunk in chunks:
        assert isinstance(chunk, ChunkSpec)
        assert chunk.content
        assert chunk.section
        assert chunk.type


@pytest.mark.asyncio
async def test_index_profile_contract() -> None:
    owner_id = uuid.uuid4()
    # Verifies contract executes cleanly
    await index_profile(owner_id=owner_id, version=1)


# ==========================================
# Chat Service Tests
# ==========================================


def test_route_question_intents() -> None:
    assert route_question("How can I email Alex?", []) == Route.CONTACT_INFO
    assert (
        route_question("What is Alex's experience with Kafka?", [])
        == Route.PROFILE_RAG
    )
    assert (
        route_question("What will the weather be tomorrow in London?", [])
        == Route.OUT_OF_SCOPE
    )


@pytest.mark.asyncio
async def test_answer_stream_contract() -> None:
    owner_id = uuid.uuid4()
    site_id = uuid.uuid4()
    events: list[ChatEvent] = []

    # Test stream contract
    async for event in answer(
        owner_id=owner_id,
        site_id=site_id,
        question="Tell me about Alex's engineering background",
        history=[],
    ):
        events.append(event)

    event_names = [e.event for e in events]
    assert "token" in event_names
    assert "done" in event_names
    # If candidate site is published or in stub/mock mode, sources will be present;
    # otherwise unindexed/unpublished site returns informative token and done.
    assert len(events) >= 2
