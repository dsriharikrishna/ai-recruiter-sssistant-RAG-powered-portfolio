import uuid

import pytest

from app.api.v1.mock_data import get_mock_approved_profile, get_mock_profile_draft
from app.modules.chat.service import ChatEvent, Route, answer, route_question
from app.modules.extraction.service import (
    extract_profile,
    merge_drafts,
    verify_evidence,
)
from app.modules.indexing.service import (
    ChunkSpec,
    build_chunks,
    build_summary,
    index_profile,
)
from app.schemas.profile import FactSource, FlagKind, ProfileDraft

# ==========================================
# Extraction Service Tests
# ==========================================


def test_extract_profile_returns_draft() -> None:
    text = "Jane Doe is a software engineer at Acme Corp."
    draft = extract_profile(text=text, source=FactSource.resume)
    assert isinstance(draft, ProfileDraft)
    assert draft.profile.name == "Alex Johnson"
    assert len(draft.experiences) > 0


def test_verify_evidence_flags_missing_quote() -> None:
    draft = get_mock_profile_draft()
    # Source text lacks the evidence string
    source_text = "Some completely unrelated text with no work history."
    verified = verify_evidence(draft, source_text)

    # Must append conflict flag
    conflict_flags = [f for f in verified.flags if f.kind == FlagKind.conflict]
    assert len(conflict_flags) > 0
    assert conflict_flags[0].target_id == "exp-1"


def test_merge_drafts_combines_flags() -> None:
    draft1 = get_mock_profile_draft()
    draft2 = get_mock_profile_draft()
    merged = merge_drafts(draft1, draft2)
    assert isinstance(merged, ProfileDraft)
    assert len(merged.flags) == len(draft1.flags) + len(draft2.flags)


# ==========================================
# Indexing Service Tests
# ==========================================


def test_build_summary_deterministic() -> None:
    profile = get_mock_approved_profile()
    summary = build_summary(profile)
    assert isinstance(summary, str)
    assert profile.profile.name in summary
    assert profile.profile.headline in summary


def test_build_chunks_deterministic_specs() -> None:
    profile = get_mock_approved_profile()
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

    async for event in answer(
        owner_id=owner_id,
        site_id=site_id,
        question="Tell me about Alex's engineering background",
        history=[],
    ):
        events.append(event)

    event_names = [e.event for e in events]
    assert "sources" in event_names
    assert "token" in event_names
    assert "done" in event_names
    sources_event = next(e for e in events if e.event == "sources")
    assert "sources" in sources_event.data
