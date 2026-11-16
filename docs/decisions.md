# Architectural Decisions Log (ADR)

## ADR 1: Tenant Isolation Strategy (Double-Layer Defense)
- **Status**: Accepted
- **Context**: The platform hosts proprietary candidate resumes, contact details, and career histories across thousands of distinct users. Cross-tenant data leakage is unacceptable.
- **Decision**: Implement a double-layer isolation architecture:
  1. *Application / Repository Layer*: Every repository class inherits from `BaseTenantRepository` and requires `owner_id: uuid.UUID` across all read and write methods.
  2. *Database Layer*: PostgreSQL Row Level Security (RLS) is enabled on all tenant tables (`FORCE ROW LEVEL SECURITY`). Every request sets `SET LOCAL app.owner_id` within the transaction scope.
- **Consequences**: Queries cannot accidentally omit tenant filtering; service-role access is segregated.

---

## ADR 2: Deterministic Chunking & Summarization (No LLM for Indexing)
- **Status**: Accepted
- **Context**: LLM-based chunking introduces latency, cost, nondeterministic boundaries, and potential hallucinations during vector indexing.
- **Decision**: Indexing and summarization from the `ApprovedProfile` JSON are 100% deterministic template-driven functions:
  - Each fact entity (experience, project, skill, education, certification) produces a dedicated chunk with an explicit contextual header (`Candidate: {name} | Experience at {company}`).
  - Metadata retains `entity_id`, `section`, `type`, and `owner_id`.
  - Content SHA256 hashes enable atomic diff-based re-indexing (only changed chunks are embedded).
- **Consequences**: Zero LLM spend on re-indexing; predictable retrieval performance; verifiable vector boundaries.

---

## ADR 3: Strict Grounding & Recruiter Bot Routing
- **Status**: Accepted
- **Context**: Recruiter chatbot must represent the candidate accurately without confabulating qualifications or answering off-topic questions.
- **Decision**:
  - Implement intent routing before RAG retrieval (`Route.PROFILE_RAG`, `Route.CONTACT_INFO`, `Route.OUT_OF_SCOPE`, `Route.SALARY_POLICY`).
  - Out-of-scope or unverified questions immediately return polite refusals with candidate contact details, bypassing LLM generation.
  - Hybrid search merges vector similarity (pgvector HNSW) and keyword search (tsvector BM25) with Reciprocal Rank Fusion (RRF).
- **Consequences**: Halts prompt injection and topic drifting; ensures verifiable answers backed by citations.

---

## ADR 4: Pydantic v2 Canonical Schema & Auto-Generated OpenAPI Client
- **Status**: Accepted
- **Context**: Discrepancies between frontend and backend models create runtime breakages.
- **Decision**:
  - Python Pydantic v2 models in `app/schemas/profile.py` define the canonical profile schema.
  - FastAPI exports `docs/openapi.json`.
  - Next.js frontend uses `openapi-typescript` to generate strict TypeScript interfaces (`apps/web/src/api/types.ts`).
- **Consequences**: End-to-end type safety from database models down to React components with zero manual duplicate type definitions.

