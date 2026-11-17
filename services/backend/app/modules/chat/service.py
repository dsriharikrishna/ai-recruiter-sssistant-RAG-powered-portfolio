import asyncio
import uuid
from collections.abc import AsyncIterator
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class Route(StrEnum):
    DIRECT_ANSWER = "direct_answer"
    PROFILE_RAG = "profile_rag"
    CONTACT_INFO = "contact_info"
    OUT_OF_SCOPE = "out_of_scope"


class ChatEvent(BaseModel):
    event: str
    data: dict[str, Any] = Field(default_factory=dict)


def route_question(question: str, history: list[dict[str, str]]) -> Route:
    """Classify user intent to route question to correct RAG / retrieval strategy.

    Real implementation requirement:
    1. Fast heuristic / lightweight LLM intent classification.
    2. Recognizes contact inquiries, candidate profile RAG, or out-of-scope queries.
    3. Prevents answering topics unrelated to the candidate's approved data.

    Stub behavior:
    Heuristic check based on query keywords.
    """
    q_lower = question.lower()
    if any(k in q_lower for k in ["email", "phone", "contact", "linkedin", "reach"]):
        return Route.CONTACT_INFO
    if any(
        k in q_lower
        for k in ["who are you", "weather", "politics", "president", "unrelated"]
    ):
        return Route.OUT_OF_SCOPE
    return Route.PROFILE_RAG


async def answer(
    owner_id: uuid.UUID,
    site_id: uuid.UUID,
    question: str,
    history: list[dict[str, str]],
) -> AsyncIterator[ChatEvent]:
    """Stream answers grounded strictly in the candidate's approved profile.

    Real implementation requirement:
    1. Route question with `route_question`.
    2. If OUT_OF_SCOPE: Emit canned polite refusal without calling LLM.
    3. Retrieve top-k chunks from `chunks` table using hybrid search (pgvector + GIN).
    4. Call LLM with strict recruiter system prompt requiring citations.
    5. Yield SSE events:
       - `sources`: retrieved chunk metadata
       - `token`: streaming tokens
       - `done`: completed generation with token counts
       - `error`: safe error notifications

    Stub behavior:
    Yields canned sources event, token chunks, and done event.
    """
    route = route_question(question, history)

    if route == Route.OUT_OF_SCOPE:
        msg = "I can only answer questions related to the candidate's background."
        yield ChatEvent(
            event="token",
            data={"token": msg},
        )
        yield ChatEvent(event="done", data={"done": True})
        return

    # Yield mock sources
    yield ChatEvent(
        event="sources",
        data={
            "sources": [
                {
                    "entity_id": "exp-1",
                    "title": "Staff Infrastructure Engineer at Acme Cloud",
                }
            ]
        },
    )
    await asyncio.sleep(0.01)

    # Yield streaming tokens
    sample_text = (
        "Alex has over 10 years of experience designing high-throughput distributed "
        "systems, cloud infrastructure, and PostgreSQL data platforms."
    )
    for word in sample_text.split():
        yield ChatEvent(event="token", data={"token": f"{word} "})
        await asyncio.sleep(0.01)

    yield ChatEvent(
        event="done",
        data={"done": True, "prompt_tokens": 120, "completion_tokens": 35},
    )
