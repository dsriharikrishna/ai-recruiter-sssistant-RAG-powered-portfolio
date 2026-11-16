# Implementation Tasks

This file outlines the next immediate implementation tasks to replace stub implementations with real components.

---

### Task 1: Real `extract_profile` on One Fixture
- **Goal**: Implement real LLM extraction from raw resume text adhering to `ProfileDraft` schema on the `placeholder` fixture.
- **File to Change**:
  - `apps/api/app/modules/extraction/service.py`
- **Interface to Keep**:
  ```python
  def extract_profile(text: str, source: FactSource) -> ProfileDraft:
      ...
  ```
- **Requirements**:
  - Delimit raw resume text to mitigate prompt injection.
  - Call OpenAI structured outputs (via Instructor or native json_schema).
  - Extract entities with verbatim `evidence` quotes from `text`.
  - Handle date normalization to `YYYY-MM` or `YYYY`.
- **Test That Must Pass**:
  - `python -m app.evals.run` (Accuracy >= 95%, Invented Items == 0).
  - `apps/api/tests/test_evals.py`.

---

### Task 2: Deterministic `build_chunks` & Vector Store Insertion
- **Goal**: Connect `build_chunks` and `index_profile` to live PostgreSQL pgvector and tsvector storage.
- **File to Change**:
  - `apps/api/app/modules/indexing/service.py`
- **Interface to Keep**:
  ```python
  def build_chunks(profile: ApprovedProfile) -> list[ChunkSpec]:
      ...

  async def index_profile(owner_id: uuid.UUID, version: int) -> None:
      ...
  ```
- **Requirements**:
  - Deterministic chunk formatting (no LLM in chunking).
  - Compute SHA256 content hashes.
  - Generate embeddings in batches via OpenAI `text-embedding-3-small` (1536 dims).
  - Save to `chunks` table respecting `owner_id` tenant isolation.
- **Test That Must Pass**:
  - `apps/api/tests/test_stubs.py::test_build_chunks_deterministic_specs`
  - Integration test verifying vector retrieval similarity match on indexed chunks.

---

### Task 3: Interactive Review Form with Conflict Flags
- **Goal**: Enhance the frontend review dashboard with interactive conflict resolution and section-by-section confirmation.
- **File to Change**:
  - `apps/web/src/app/dashboard/review/page.tsx`
- **Interface to Keep**:
  - Calls `api.getProfileDraft()`, `api.patchProfileDraft()`, and `api.approveProfile()`.
- **Requirements**:
  - Display warning banners for unresolved flags (`FlagKind.conflict`, `FlagKind.needs_confirmation`).
  - Provide inline editing for fact fields (role, company, dates, description).
  - Allow user to resolve or dismiss individual flags.
  - Block "Approve & Publish" button until critical flags are resolved or explicitly acknowledged.
- **Test That Must Pass**:
  - `pnpm --filter web test:unit`
  - Playwright review flow test.

---

### Task 4: First Portfolio Template Selection & Rendering
- **Goal**: Support 2 distinct visual themes/templates for public portfolio pages (`minimal` and `modern`).
- **Files to Change**:
  - `apps/web/src/app/[username]/page.tsx`
  - `apps/web/src/components/templates/MinimalTemplate.tsx`
  - `apps/web/src/components/templates/ModernTemplate.tsx`
- **Interface to Keep**:
  - Consumes `PublicSiteResponse` from `api.getPublicSite(slug)`.
- **Requirements**:
  - Dynamic template switching based on `site.template`.
  - Accessible, responsive layout with mobile drawer for the AI chatbot widget.
  - Sanitized markdown rendering for candidate summary and project details.
- **Test That Must Pass**:
  - `pnpm --filter web tsc --noEmit`
  - `pnpm --filter web lint`
  - Playwright visual regression / smoke test (`apps/web/tests/smoke.spec.ts`).

