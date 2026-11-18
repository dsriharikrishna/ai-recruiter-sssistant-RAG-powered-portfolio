import asyncio
import uuid
from collections.abc import AsyncIterator
from enum import StrEnum
from typing import Any

from sqlalchemy import select

from app.db.session import get_session_factory
from app.models.models import ProfileVersionModel, Site
from app.schemas.api_v1 import ChatEvent, ChatMessageHistory, ChatSourceItem
from app.schemas.profile import ApprovedProfile


class Route(StrEnum):
    DIRECT_ANSWER = "direct_answer"
    PROFILE_RAG = "profile_rag"
    CONTACT_INFO = "contact_info"
    OUT_OF_SCOPE = "out_of_scope"


def route_question(question: str, history: list[ChatMessageHistory] | list[dict[str, str]]) -> Route:
    q_lower = question.lower()
    if any(k in q_lower for k in ["email", "phone", "contact", "linkedin", "reach", "call"]):
        return Route.CONTACT_INFO
    if any(
        k in q_lower
        for k in ["weather", "politics", "president", "recipe", "who won", "bitcoin", "crypto"]
    ):
        return Route.OUT_OF_SCOPE
    return Route.PROFILE_RAG


async def answer(
    owner_id: uuid.UUID,
    site_id: uuid.UUID,
    question: str,
    history: list[ChatMessageHistory] | list[dict[str, str]],
) -> AsyncIterator[ChatEvent]:
    """Stream answers grounded strictly in the candidate's approved profile loaded from database."""
    route = route_question(question, history)

    if route == Route.OUT_OF_SCOPE:
        msg = "I can only answer questions directly related to this candidate's verified professional background."
        yield ChatEvent(event="token", data={"token": msg})
        yield ChatEvent(event="done", data={"done": True})
        return

    # Load candidate's real profile from database
    session_factory = get_session_factory()
    approved_profile: ApprovedProfile | None = None
    async with session_factory() as session:
        site_res = await session.execute(select(Site).where(Site.id == site_id))
        site = site_res.scalar_one_or_none()
        if site and site.published_version:
            ver_res = await session.execute(
                select(ProfileVersionModel).where(
                    ProfileVersionModel.owner_id == site.owner_id,
                    ProfileVersionModel.version == site.published_version,
                )
            )
            version_rec = ver_res.scalar_one_or_none()
            if version_rec:
                approved_profile = ApprovedProfile(**version_rec.approved)

    if not approved_profile:
        msg = "This candidate does not have a published profile version yet."
        yield ChatEvent(event="token", data={"token": msg})
        yield ChatEvent(event="done", data={"done": True})
        return

    candidate_name = approved_profile.profile.name
    experiences = approved_profile.experiences
    skills = approved_profile.skills
    projects = approved_profile.projects
    contact = approved_profile.contact

    # Route: Contact Information
    if route == Route.CONTACT_INFO:
        links_str = ", ".join([l.url for l in contact.links if l.is_public])
        email_str = contact.email if contact.email_public else "Private"
        contact_msg = f"{candidate_name}'s contact: Email: {email_str}. Links: {links_str or 'None provided'}."
        yield ChatEvent(event="sources", data={"sources": [ChatSourceItem(entity_id="contact", title="Verified Contact Details").model_dump()]})
        for word in contact_msg.split():
            yield ChatEvent(event="token", data={"token": f"{word} "})
            await asyncio.sleep(0.015)
        yield ChatEvent(event="done", data={"done": True})
        return

    # Route: Profile RAG Retrieval based on query
    matched_sources: list[ChatSourceItem] = []
    matched_snippets: list[str] = []

    q_lower = question.lower()
    for exp in experiences:
        comp = exp.company
        role = exp.role
        desc = exp.description
        if any(term in f"{comp} {role} {desc}".lower() for term in q_lower.split() if len(term) > 3):
            matched_sources.append(ChatSourceItem(entity_id=exp.id, title=f"{role} at {comp}"))
            matched_snippets.append(f"{role} at {comp} ({exp.start_date} - {exp.end_date or 'Present'}): {desc}")

    for proj in projects:
        p_name = proj.name
        p_desc = proj.description
        if any(term in f"{p_name} {p_desc}".lower() for term in q_lower.split() if len(term) > 3):
            matched_sources.append(ChatSourceItem(entity_id=proj.id, title=f"Project: {p_name}"))
            matched_snippets.append(f"Project '{p_name}': {p_desc}")

    # Fallback to general background if no keyword match
    if not matched_sources and experiences:
        first_exp = experiences[0]
        matched_sources.append(ChatSourceItem(entity_id=first_exp.id, title=f"{first_exp.role} at {first_exp.company}"))
        matched_snippets.append(f"{first_exp.role} at {first_exp.company}: {first_exp.description}")

    # Emit real sources from candidate's verified profile
    yield ChatEvent(event="sources", data={"sources": [s.model_dump() for s in matched_sources]})
    await asyncio.sleep(0.01)

    headline = approved_profile.profile.headline
    summary = approved_profile.profile.summary
    answer_text = (
        f"Based on {candidate_name}'s verified background ({headline}): "
        + " ".join(matched_snippets[:2])
    )
    if not matched_snippets:
        answer_text = f"{candidate_name}'s verified record states: {summary}"

    for word in answer_text.split():
        yield ChatEvent(event="token", data={"token": f"{word} "})
        await asyncio.sleep(0.015)

    yield ChatEvent(event="done", data={"done": True})
