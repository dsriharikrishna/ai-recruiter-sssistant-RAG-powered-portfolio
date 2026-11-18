import json
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.db.session import get_db_session
from app.features.chat.service import answer
from app.models.models import Site
from app.schemas.api_v1 import PublicChatRequest

router = APIRouter(tags=["chat"])


@router.post(
    "/public/chat/stream",
    summary="Stream recruiter chatbot response via Server-Sent Events",
)
async def public_chat_stream(
    request: PublicChatRequest,
    session: AsyncSession = Depends(get_db_session),
) -> EventSourceResponse:
    # Find site
    site_res = await session.execute(select(Site).where(Site.slug == request.slug))
    site = site_res.scalar_one_or_none()

    owner_id = site.owner_id if site else uuid.uuid4()
    site_id = site.id if site else uuid.uuid4()

    async def event_generator() -> AsyncGenerator[dict[str, Any], None]:
        async for chat_event in answer(
            owner_id=owner_id,
            site_id=site_id,
            question=request.message,
            history=[],
        ):
            yield {
                "event": chat_event.event,
                "data": json.dumps(chat_event.data),
            }

    return EventSourceResponse(event_generator())
