# System Architecture

This document describes the end-to-end architecture, user flows, and backend data flows of the AI Recruiter Assistant platform.

---

## 1. System Overview

```
 [Candidate Browser]            [Recruiter Browser]
         │                               │
         ▼                               ▼
   Next.js 16 Web App (apps/web) ────────┼──────────────┐
         │                               │              │
         │ REST API                      │ SSE Stream   │ Static Revalidation
         ▼                               ▼              ▼
   FastAPI Backend (apps/api) ──────────────────────────┘
         │
         ├─── PostgreSQL 16 + pgvector (Tenant RLS + HNSW + tsvector)
         ├─── Redis 7 (Rate limits, job queue & session cache)
         └─── External LLM Services (OpenAI Embeddings & Chat Completion)
```

---

## 2. User Flows

### A. Candidate Owner Flow
1. **Sign Up & Dev Auth**: Candidate registers and verifies credentials via standard JWT or dev auth.
2. **Resume & Portfolio Upload**: Candidate uploads resume (PDF/DOCX) or optional portfolio URL. File stored under `owner_id/uuid`. Background job triggers text extraction.
3. **Structured Review**: Extracted facts are displayed with type tags (`work`, `education`, etc.), hover evidence quotes, and conflict flags. Candidate resolves flags and edits fields.
4. **Approve & Publish**: On approval, an immutable `profile_versions` snapshot is created. Deterministic chunking runs and stores embeddings. Candidate publishes to a public slug (e.g. `/alex-johnson`).
5. **Dashboard Management**: Candidate monitors recruiter interactions, unanswered questions inbox, and toggles bot availability.

### B. Recruiter Flow
1. Opens public portfolio at `/[username]`.
2. Inspects candidate background, experience, projects, and public contact information.
3. Interacts with the embedded AI Recruiter Assistant widget:
   - Queries candidate's skills, achievements, or project details.
   - Receives real-time streaming answer with verbatim source citations.
   - Questions outside the verified background receive a polite refusal with direct contact buttons.

---

## 3. Backend Data Flow

### A. Upload and Extraction
1. `POST /v1/resumes`: Validates file size, extension, magic bytes. Creates `documents` and `extraction_jobs` rows. Returns `202 Accepted` with `job_id`.
2. Worker extracts text, applies prompt injection sanitization, and structures content via LLM into Pydantic models.
3. Verification engine verifies that every evidence quote exists verbatim in source text. Discrepancies generate `Flag` items with `FlagKind.conflict` or `FlagKind.needs_confirmation`.
4. Saves draft in `profile_drafts` with `owner_id`.

### B. Deterministic Indexing
1. `POST /v1/profile/approve`: Locks immutable version in `profile_versions`.
2. `build_chunks`: Generates discrete chunks for each entity with contextual headers.
3. Content SHA256 hashes determine changed chunks; only new or modified chunks are embedded via OpenAI API.
4. Chunks are stored in `chunks` table with pgvector embeddings and tsvector search tokens.

### C. Recruiter Chat & RAG Execution
1. `POST /public/chat/stream`:
   - Validates rate limits and bot enabled status.
   - Question is routed: if contact/salary policy, responds immediately from user settings.
   - If profile question: embeds query, runs hybrid vector + tsvector search with Reciprocal Rank Fusion (RRF).
   - Verifies score thresholds; if below threshold, returns "not in the portfolio".
   - Streams SSE events (`token`, `sources`, `done`) with verified chunk citations.

---

## 4. Tenant Isolation & Security
- **Repository Pattern**: Strict enforcement requiring `owner_id` on all database operations.
- **Postgres Row Level Security (RLS)**: Enforces database-level isolation per transaction.
- **SSRF Protection**: URL fetching restricts internal/private IP ranges and enforces strict timeouts.
