# System Features Specification

## 1. Overview
The platform is a multi-tenant portfolio generator and AI-powered recruiter assistant. Candidates upload resumes and optional portfolio links, the system extracts verified facts with explicit evidence quotes, the candidate reviews and approves the structured draft, and a public portfolio is published with an interactive AI recruiter chatbot answering strictly from approved candidate facts.

---

## 2. Core Feature Breakdown

### 2.1 Multi-Tenant Authentication & Identity
- **Owner Authentication**: Supports JWT verification (JWKS / RS256 or shared secret / HS256) and a configurable `DEV_AUTH` mode with `X-Dev-User` header for local development.
- **Production Guardrail**: Refuses to boot if `DEV_AUTH=True` in production environments.
- **Tenant Isolation**:
  - Every database query and repository operation requires `owner_id`.
  - Database-enforced Postgres Row Level Security (RLS) on all tenant tables with `FORCE ROW LEVEL SECURITY`.
  - Introspection tests enforce that no public repository method can execute without receiving an `owner_id`.

### 2.2 Resume & Link Ingestion
- Upload PDF, DOCX, or plain text resumes.
- Extraction job tracking with polling state machine (`pending` -> `processing` -> `completed` / `failed`).
- Raw text storage tied to document and tenant records.

### 2.3 Strict Evidence-Based Fact Extraction
- Structured extraction following the canonical `ApprovedProfile` Pydantic v2 schema (`services/backend/app/schemas/profile.py` / `docs/profile.schema.json`).
- **Zero Hallucination Rule**: Every extracted fact (role, company, skill, project, education, certification) includes:
  - `fact_type`: Type classification.
  - `source`: Source identifier (`resume`, `portfolio_link`, or `manual_entry`).
  - `evidence`: Verbatim quote from the source text.
- Conflict detection and warning flags (`FlagKind.conflict`, `FlagKind.needs_confirmation`, `FlagKind.missing_evidence`).

### 2.4 Interactive Candidate Review Dashboard
- Web interface located at `/dashboard/review`.
- Section-by-section fact inspection:
  - Header & Contact information.
  - Professional summary.
  - Work Experience & Projects.
  - Skills, Education, & Certifications.
- Interactive flag review: review warnings, edit fields inline, and resolve/dismiss flags.
- Atomic approval: transition profile draft to a versioned `ApprovedProfile` snapshot.

### 2.5 Hybrid Vector & Text Indexing
- Contextual chunking with parent-document headers.
- Embeddings generated via OpenAI `text-embedding-3-small` (1536 dimensions).
- Hybrid search index:
  - Pgvector HNSW index for dense vector similarity.
  - PostgreSQL `tsvector` with GIN indexing for keyword and BM25 lexical search.
- Tenant isolation on vector store: chunk records strictly scoped to candidate `owner_id`.

### 2.6 Public Candidate Portfolio Sites
- Public portfolio rendering at `/[username]` (site slug lookup).
- Candidate themes/templates (`minimal`, `modern`).
- Responsive UI built with Tailwind CSS, accessible components, and clean typography.

### 2.7 Recruiter AI Chatbot (RAG SSE Stream)
- Embedded interactive chat assistant on public portfolio pages.
- Query intent classification:
  - `PROFILE_RAG`: Candidate questions answered strictly using approved profile chunks with similarity thresholding.
  - `CONTACT_INFO`: Answers from approved contact info or bot settings.
  - `OUT_OF_SCOPE`: Refusal or graceful deflection when inquiries exceed approved facts.
- Real-time Server-Sent Events (SSE) streaming (`sources`, `token`, `done`, `error`).
- Audit logging of unanswered questions (`unanswered_questions` table) to help candidates discover missing portfolio details.
