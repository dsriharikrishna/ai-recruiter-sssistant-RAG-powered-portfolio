import uuid
from typing import Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import get_embedding_dim
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

EMBEDDING_DIM = get_embedding_dim()


class User(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="owner", cascade="all, delete-orphan"
    )
    profile_drafts: Mapped[list["ProfileDraftModel"]] = relationship(
        "ProfileDraftModel", back_populates="owner", cascade="all, delete-orphan"
    )
    profile_versions: Mapped[list["ProfileVersionModel"]] = relationship(
        "ProfileVersionModel", back_populates="owner", cascade="all, delete-orphan"
    )
    chunks: Mapped[list["Chunk"]] = relationship(
        "Chunk", back_populates="owner", cascade="all, delete-orphan"
    )
    sites: Mapped[list["Site"]] = relationship(
        "Site", back_populates="owner", cascade="all, delete-orphan"
    )
    usage_events: Mapped[list["UsageEvent"]] = relationship(
        "UsageEvent", back_populates="owner", cascade="all, delete-orphan"
    )


class Document(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "documents"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    kind: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)

    owner: Mapped[User] = relationship("User", back_populates="documents")
    extraction_jobs: Mapped[list["ExtractionJob"]] = relationship(
        "ExtractionJob", back_populates="document", cascade="all, delete-orphan"
    )


class ExtractionJob(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "extraction_jobs"

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    error_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timings: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    document: Mapped[Document] = relationship(
        "Document", back_populates="extraction_jobs"
    )


class ProfileDraftModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "profile_drafts"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    flags: Mapped[list[Any]] = mapped_column(JSONB, default=list, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    owner: Mapped[User] = relationship("User", back_populates="profile_drafts")


class ProfileVersionModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "profile_versions"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    approved: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    extraction_diff: Mapped[dict[str, Any]] = mapped_column(
        JSONB, default=dict, nullable=False
    )

    owner: Mapped[User] = relationship("User", back_populates="profile_versions")

    __table_args__ = (
        UniqueConstraint(
            "owner_id", "version", name="uq_profile_versions_owner_version"
        ),
    )


class Chunk(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "chunks"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    embedding: Mapped[list[float]] = mapped_column(
        Vector(EMBEDDING_DIM), nullable=False
    )
    tsv: Mapped[Any] = mapped_column(TSVECTOR, nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    section: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    owner: Mapped[User] = relationship("User", back_populates="chunks")

    __table_args__ = (
        Index(
            "ix_chunks_embedding_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        Index("ix_chunks_tsv_gin", "tsv", postgresql_using="gin"),
    )


class Site(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "sites"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    template: Mapped[str] = mapped_column(String(50), default="default", nullable=False)
    theme: Mapped[str] = mapped_column(String(50), default="light", nullable=False)
    published_version: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bot_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    bot_settings: Mapped[dict[str, Any]] = mapped_column(
        JSONB, default=dict, nullable=False
    )

    owner: Mapped[User] = relationship("User", back_populates="sites")
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="site", cascade="all, delete-orphan"
    )
    unanswered_questions: Mapped[list["UnansweredQuestion"]] = relationship(
        "UnansweredQuestion", back_populates="site", cascade="all, delete-orphan"
    )


class Conversation(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "conversations"

    site_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    site: Mapped[Site] = relationship("Site", back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )


class Message(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_ids: Mapped[list[Any]] = mapped_column(JSONB, default=list, nullable=False)
    prompt_version: Mapped[str] = mapped_column(
        String(50), default="v1", nullable=False
    )
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    conversation: Mapped[Conversation] = relationship(
        "Conversation", back_populates="messages"
    )


class UnansweredQuestion(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "unanswered_questions"

    site_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    attempted_answer: Mapped[str | None] = mapped_column(Text, nullable=True)

    site: Mapped[Site] = relationship("Site", back_populates="unanswered_questions")


class UsageEvent(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "usage_events"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB, default=dict, nullable=False
    )

    owner: Mapped[User] = relationship("User", back_populates="usage_events")
