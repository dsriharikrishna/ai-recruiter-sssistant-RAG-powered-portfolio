# Sprint Planning & Implementation Roadmap

Based on [BUILD_PLAN.md](file:///c:/Users/Signi/Documents/WorkSpace/WebApplications/ai-recruiter-sssistant-RAG-powered-portfolio/BUILD_PLAN.md), the system architecture, and current repository milestones, development is structured into 4 sequential production sprints.

---

## Sprint 1: Production Data Ingestion & LLM Extraction
**Objective**: Transition from mock extraction to real OpenAI structured fact extraction with zero hallucination and strict evidence grounding.

- **Sprint Goal**: Candidate uploads a PDF/DOCX or text resume and receives an extraction draft where 100% of facts are tied to verbatim quotes from source text.
- **Backlog Tasks**:
  1. **Task 1.1: Document Parsing & Anti-Injection Sanitization**
     - Add file parsing for PDF (PyMuPDF) and DOCX (python-docx).
     - Implement delimiter encapsulation to treat resume text strictly as untrusted data.
     - Detect and reject empty/scanned PDFs (`scanned_pdf` error code).
  2. **Task 1.2: Real LLM Structured Extraction**
     - File: `services/backend/app/modules/extraction/service.py`
     - Integrate OpenAI structured outputs (`gpt-4o-mini` or `gpt-4o`) adhering to `ProfileDraft` schema.
     - Partition extraction into sectioned prompts (Profile/Contact, Experience, Projects, Skills/Education/Certs).
  3. **Task 1.3: Programmatic Evidence Verification & Normalization**
     - Implement fuzzy substring match verification in `verify_evidence`.
     - Flag missing evidence with `FlagKind.missing_evidence`.
     - Standardize dates to `YYYY-MM` or `YYYY`.
  4. **Task 1.4: Fixture Evaluation Validation**
     - Target: `python -m app.evals.run` passing with $\ge 95\%$ accuracy and $0$ invented facts.

---

## Sprint 2: Hybrid Vector Indexing & RLS Persistence
**Objective**: Transform approved profile versions into isolated pgvector embeddings and PostgreSQL tsvector indexes with tenant isolation.

- **Sprint Goal**: Publishing or approving a profile automatically indexes chunks with zero cross-tenant leakage.
- **Backlog Tasks**:
  1. **Task 2.1: Deterministic Chunk Construction**
     - File: `services/backend/app/modules/indexing/service.py`
     - Deterministic chunking: one chunk per Experience, Project, Skill group, Education, Certification, and Policy.
     - Contextual metadata prefixes (e.g. `Project: Platform X, Experience, 2024`).
     - Content hashing via SHA-256 for change detection.
  2. **Task 2.2: Batch Vector Embedding Generation**
     - Connect OpenAI `text-embedding-3-small` (1536 dims).
     - Exponential backoff and retry handling.
  3. **Task 2.3: Database Index Insertion & Tenant Isolation**
     - Persist chunks to `chunks` table with `owner_id`.
     - Confirm pgvector HNSW index and tsvector GIN index updates.
     - Integration tests: verify tenant A cannot retrieve tenant B chunks.

---

## Sprint 3: Candidate Review Dashboard & Conflict Resolution
**Objective**: Complete the interactive web dashboard for conflict inspection, manual editing, and profile approval.

- **Sprint Goal**: Candidate can review warnings, resolve conflicts, edit fields inline, and approve their profile with real API persistence.
- **Backlog Tasks**:
  1. **Task 3.1: Interactive Conflict & Flag UI**
     - File: `services/frontend/src/app/dashboard/review/page.tsx`
     - Display warning cards for `FlagKind.conflict` and `FlagKind.needs_confirmation`.
     - Provide dismiss / resolve actions.
  2. **Task 3.2: Inline Fact Editing & Autosave**
     - Form editing for Experience, Projects, Skills, and Contact details.
     - Optimistic UI updates with TanStack Query against `PATCH /v1/profile/draft`.
  3. **Task 3.3: Approval & Publishing Pipeline Trigger**
     - Prevent approval if critical unacknowledged flags remain.
     - Call `POST /v1/profile/approve` and route to template selection.
  4. **Task 3.4: E2E Review Flow Testing**
     - Add Playwright E2E test verifying review, flag dismissal, and approval flow.

---

## Sprint 4: Public Portfolio Templates & Real-time Recruiter Chatbot
**Objective**: Deliver public portfolio templates and the RAG-powered recruiter chatbot with SSE streaming and grounding checks.

- **Sprint Goal**: Public visitors can browse candidate profiles across multiple templates and interact with the AI assistant answering strictly from candidate data.
- **Backlog Tasks**:
  1. **Task 4.1: Public Portfolio Templates**
     - Implement `MinimalTemplate.tsx` and `ModernTemplate.tsx` in `services/frontend`.
     - Follow UI/UX Pro Max standards, typography scales, and responsive layouts.
     - Live theme/template switcher.
  2. **Task 4.2: Recruiter Chat Query Intent Router**
     - File: `services/backend/app/modules/chat/service.py`
     - Classify intents: `PROFILE_RAG`, `CONTACT_INFO`, `OUT_OF_SCOPE`.
     - Deflect out-of-scope or prompt-injection queries gracefully.
  3. **Task 4.3: Hybrid RAG Search (Vector + BM25 Lexical)**
     - Execute hybrid SQL search (top 20 vector + top 20 tsvector merged via Reciprocal Rank Fusion).
     - Threshold filtering: return "not in the portfolio" if similarity is below cutoff.
  4. **Task 4.4: SSE Assistant Streaming & Unanswered Question Audit**
     - Stream tokens via Server-Sent Events (`sources`, `token`, `done`, `error`).
     - Log unhandled or missing questions into `unanswered_questions` table for candidate review.
