# BUILD_PLAN.md

Setup plan for a multi-tenant portfolio builder with a RAG recruiter chatbot.
This file is a specification for the coding agent. The agent must not edit it.

---

## EXECUTION PROTOCOL (read first, applies to every prompt)

1. Execute exactly ONE prompt at a time, in order. Start with the first prompt not marked "done" in `PROGRESS.md`. If `PROGRESS.md` does not exist yet, start with Prompt 0.
2. Read only the section for the current prompt. Do NOT implement anything from later prompts, even if it looks convenient or small.
3. When the prompt's work is finished:
   - Run every command the prompt asks for.
   - Show the real output, including failures. Do not summarize output you did not see.
   - Update `PROGRESS.md` (status, commands run, results, open issues).
   - Write a short summary: what changed, what you ran, what failed, what is next.
   - Then STOP and wait for the human to reply "proceed". Do not start the next prompt on your own.
4. Never mark anything as passing unless you ran it in this session.
5. If a prompt conflicts with `AGENTS.md`, stop and ask the human.
6. If something is ambiguous or blocked, ask. Do not invent requirements, data, or facts.
7. Do not add dependencies without listing them and the reason in your summary.
8. Use current stable versions and check official docs rather than relying on memory.
9. Ask before destructive commands or global installs.

HUMAN REVIEW POINTS: the human reviews code before saying "proceed" after Prompts 4, 5, and 6.
HUMAN-ONLY STEP: the human writes the fixture resumes (before Prompt 10). The agent must never generate fixture content.

If a session resets: start a new session and say "Read BUILD_PLAN.md and PROGRESS.md, then continue with the next prompt."

---

## PROMPT 0: Rules files and progress tracker

Create `AGENTS.md` at the repo root with the rules below, and also create `.agent/rules/project.md` with the same content. Also create `PROGRESS.md` at the repo root containing a table with one row per prompt (0 to 12), columns: Prompt, Status (todo/done), Commands run and results, Open issues. Mark Prompt 0 as done once finished. Build nothing else.

```text
PROJECT: Multi-tenant portfolio builder. A user uploads a resume (mandatory) and
an optional portfolio link. We extract structured data, the user reviews and
approves it, then we generate a template-based portfolio site with a RAG
recruiter chatbot that answers ONLY from that user's approved data.

STACK: Next.js (App Router, TypeScript strict, Tailwind, shadcn/ui, TanStack
Query) in apps/web. FastAPI (Python 3.12, Pydantic v2, SQLAlchemy 2.0 async,
Alembic, pgvector) in apps/api. PostgreSQL + pgvector, Redis, Docker Compose.
uv for Python, pnpm for web. OpenAI SDK behind an internal interface. No
LangChain, no microservices, no AWS.

HARD RULES:
1. TENANT ISOLATION: every repository method takes owner_id as a required
   argument and filters by it. No query touches user data without owner_id.
   Never trust an owner_id from the client; derive it from the verified token
   or the site slug on the server.
2. The approved profile JSON (Pydantic models in
   apps/api/app/schemas/profile.py) is the single source of truth for the site
   and the chatbot. Never change that schema without flagging it clearly in
   your summary.
3. Never invent facts about a user. Every extracted fact carries a type and
   an evidence quote from the source text.
4. Do not commit secrets. Only .env.example with placeholders.
5. Do not claim tests or commands succeeded unless you ran them. Show the
   actual output, including failures.
6. Use current stable versions and check official docs rather than memory.
7. Do not add dependencies without listing them and the reason.
8. Python: full type hints, ruff, mypy. TypeScript: strict mode.
9. Work in small steps. After each task, stop and summarize: what changed,
   what you ran, what failed, what is next. Do not start the next task.
10. Ask before running destructive commands or installing global tools.
```

---

## PROMPT 1: Monorepo and tooling

Set up the monorepo skeleton. No application logic yet.

Structure:
- `apps/web`: Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, TanStack Query, ESLint, Prettier
- `apps/api`: FastAPI managed with uv, with folders: `app/api/v1`, `app/core`, `app/db`, `app/models`, `app/schemas`, `app/repositories`, `app/services`, `app/integrations`, `app/modules/{extraction,indexing,chat}`, `tests`, `fixtures`
- `docs/`, `.env.example`, `.gitignore`, `README.md`, `Makefile`

Tooling:
- Python: ruff, mypy, pytest, pytest-asyncio, httpx configured in `pyproject.toml`
- pnpm workspace for `apps/web`
- pre-commit hooks running ruff, mypy, eslint, prettier
- Makefile targets: `install`, `dev`, `test`, `lint`, `migrate`, `down`

Add a `/health` endpoint in FastAPI and one passing test for it.
Run install, lint, and tests, and show the output.

---

## PROMPT 2: Docker Compose

Create `docker-compose.yml` with services:
- `postgres` (pgvector image, persistent volume, healthcheck)
- `redis` (healthcheck)
- `api` (hot reload, depends on healthy postgres and redis)
- `web` (hot reload)

Create Dockerfiles for `api` and `web`.

Configure everything through `.env`, with `.env.example` containing placeholders only (DATABASE_URL, REDIS_URL, OPENAI_API_KEY, JWT settings, CORS_ORIGINS, ENV, DEV_AUTH). Makefile targets: `make up`, `make down`, `make logs`.

Verify: `docker compose up` brings all services healthy, `/health` responds from the api container, and the web app loads. Show the commands and outputs.

---

## PROMPT 3: Backend core and Alembic

Build the backend core:
- `app/core/config.py`: Pydantic Settings loaded from env, no defaults for secrets
- `app/db/session.py`: async SQLAlchemy engine and session dependency
- `app/core/errors.py`: centralized exception handlers with safe error messages
- Structured logging that never logs secrets or resume text
- Alembic configured for async, wired into `make migrate`
- `/ready` endpoint that checks the database and redis connection

Add tests for config loading and `/ready`. Run them and show the output.

---

## PROMPT 4: Profile schema (HUMAN REVIEWS BEFORE "proceed")

Create `apps/api/app/schemas/profile.py` with Pydantic v2 models for the approved profile. This is the central contract of the project.

Models:
- `Profile` (name, headline, summary)
- `Contact` (email, phone, links, public flags per field)
- `Experience`, `Project`, `Skill`, `Education`, `Certification`
- `BotSettings` (salary_policy, availability_policy, tone, resume_downloadable)
- `ApprovedProfile` (all of the above plus schema_version)
- `ProfileDraft` (same shape plus a list of `Flag` objects)

Rules to encode:
- `FactType` enum: work, personal_project, learning, certification, listed_only
- `FactSource` enum: resume, portfolio, user
- Every Experience, Project, Skill, Education, Certification has a stable `id`, `type`, `source`, and `evidence` (text quote). Evidence is required unless source is "user".
- `Flag`: kind (needs_confirmation, conflict), target id, message
- Dates are "YYYY-MM"; end must not be before start; ids must be unique; strings have sensible length limits.

Also export the JSON Schema to `docs/profile.schema.json`, and write unit tests for valid and invalid cases. Run the tests and show the output.
Do not add fields beyond what is listed without asking.

---

## PROMPT 5: Database models and first migration (HUMAN REVIEWS BEFORE "proceed")

Create SQLAlchemy 2.0 models and the first Alembic migration for these tables:
- `users`
- `documents` (owner_id, storage_path, kind resume|portfolio, status)
- `extraction_jobs` (document_id, status, error_code, timings)
- `profile_drafts` (owner_id, JSONB data, flags JSONB, version)
- `profile_versions` (owner_id, version, approved JSONB, extraction_diff JSONB, unique owner_id+version)
- `chunks` (owner_id, version, content, content_hash, embedding vector(1536), tsvector, type, section, entity_id)
- `sites` (owner_id, slug unique, template, theme, published_version, bot_enabled, bot settings JSONB)
- `conversations`, `messages` (site_id, role, content, chunk_ids, prompt_version, model, token counts)
- `unanswered_questions`
- `usage_events`

Requirements:
- Enable the pgvector extension in the migration.
- Make the embedding dimension a config constant.
- HNSW index on embedding, GIN on tsvector, btree on owner_id everywhere.
- Foreign keys with ON DELETE CASCADE from users so account deletion removes everything.
- Timestamps on all tables.
- Row Level Security policies on all tenant tables using `current_setting('app.owner_id')`, plus a helper that sets it with `SET LOCAL` per transaction.

Test against the real Postgres from docker compose: migrate up, migrate down, and a test proving a session with owner A cannot see owner B's rows through RLS. Show the output.

---

## PROMPT 6: Auth and repository base (HUMAN REVIEWS BEFORE "proceed")

Implement:
1. `app/core/security.py`: a `get_current_owner` FastAPI dependency. Define an interface for token verification (JWKS-based JWT validation, configured by env, provider not decided yet). Add a `DEV_AUTH=true` mode that accepts a header `X-Dev-User` for local development only, and make the app refuse to start with `DEV_AUTH=true` when `ENV=production`.
2. `app/repositories/base.py`: a base repository class where every method requires `owner_id` and applies it to every query. Include repositories for `profile_drafts`, `profile_versions`, and `sites` as examples.
3. Tests:
   - Two owners: owner A cannot read, update, or delete owner B's data through any repository method.
   - A test that inspects every public repository method and fails if one lacks an `owner_id` parameter.
   - An unauthenticated request returns 401.

Run the tests and show the output.

---

## PROMPT 7: Mock API and generated types

Create all planned endpoints as FastAPI routes with real Pydantic request and response models, returning hardcoded mock data (use a sample `ApprovedProfile` and `ProfileDraft`). No real logic.

Authenticated, under `/v1`:
- `POST /resumes` (multipart, returns 202 + job_id)
- `GET /jobs/{id}`
- `GET /profile/draft`
- `PATCH /profile/draft`
- `POST /profile/followups`
- `POST /profile/approve`
- `GET /profile/versions`
- `POST /site/publish`
- `GET /site`
- `GET /unanswered`
- `DELETE /account`

Public:
- `GET /public/sites/{slug}` (public fields only)
- `POST /public/chat/stream` (SSE with events: token, sources, done, error; stream a canned answer word by word)

Generate TypeScript types from the OpenAPI spec using openapi-typescript into `apps/web/src/api/types.ts`, with a `pnpm gen:api` script. Add a test that the OpenAPI spec generates without errors. Run it and show the output.

---

## PROMPT 8: Stubs for the real work

Create stub modules with fixed function signatures and detailed docstrings describing exactly what the real implementation must do. Each stub returns canned output so callers work.

`modules/extraction/service.py`:
- `extract_profile(text: str, source: FactSource) -> ProfileDraft`
- `verify_evidence(draft, source_text) -> ProfileDraft` (drops or flags facts whose evidence quote is not in the source)
- `merge_drafts(resume_draft, portfolio_draft) -> ProfileDraft`

`modules/indexing/service.py`:
- `build_chunks(profile: ApprovedProfile) -> list[ChunkSpec]` (deterministic, no LLM, templated header per chunk)
- `build_summary(profile) -> str` (templated, no LLM)
- `index_profile(owner_id, version) -> None`

`modules/chat/service.py`:
- `route_question(question, history) -> Route`
- `answer(owner_id, site_id, question, history) -> AsyncIterator[ChatEvent]`

Wire the mock endpoints to these stubs. Add one test per stub confirming the contract (types and shape). Do not implement any real AI logic. Run the tests and show the output.

---

## PROMPT 9: Web skeleton

Set up `apps/web` with a typed API client built on the generated types, a TanStack Query provider, and these routes calling the mock API:
- `/login` (uses DEV_AUTH in development)
- `/dashboard`
- `/dashboard/upload`
- `/dashboard/review` (renders the draft with type tags, evidence on hover, and needs-confirmation flags, plain styling only)
- `/[username]` (renders the public profile and a basic chat widget that reads the SSE stream)

No design polish, no templates yet. TypeScript strict, no `any`. Add one Vitest test for the API client and one Playwright smoke test that loads the public page and receives a streamed reply. Run them and show the output.

---

## PROMPT 10: Fixtures and eval harness (structure only)

HUMAN-ONLY STEP before this prompt: the human writes 2 or 3 fixture resumes by hand with correct expected JSON.

Create `apps/api/fixtures/resumes/<name>/` with the layout: `resume.txt` (or `.pdf`), `expected.json` (an `ApprovedProfile`), `notes.md`. Add `fixtures/README.md` explaining how to write one. Do NOT generate realistic resume content. Create only one clearly marked placeholder fixture for testing the harness.

Build an eval runner: `uv run python -m app.evals.run` that loads every fixture, calls `extract_profile`, validates against the schema, compares to `expected.json`, and prints a table: per-fixture field accuracy, number of invented items (facts in output not in expected), and number of missing items. Exit non-zero if any target is missed (targets in a config file, starting at `invented_items = 0`). Add tests for the loader and comparer using the placeholder. Run them and show the output.

---

## PROMPT 11: CI, docs, and tasks

1. GitHub Actions workflow: on PRs, run ruff, mypy, pytest (with a pgvector service container), pnpm lint, tsc, and vitest. Note the eval and leak tests as required checks.
2. Write `README.md` with exact setup steps (clone, env, make up, make migrate, make test, open URLs).
3. Write `CONTRIBUTING.md`: the tenant rule, schema-change rule, small PRs, one reviewer, AI-behavior changes must include eval results in the PR.
4. Write `docs/decisions.md` and `docs/architecture.md`. For architecture, use Appendix A at the bottom of this file.
5. Write `TASKS.md` with these tickets, each listing the file to change, the interface to keep, and the test that must pass:
   - Real `extract_profile` on one fixture
   - Deterministic `build_chunks`
   - Review form with flags
   - First template

---

## PROMPT 12: Handoff check

Verify the repo from scratch: clone it into a fresh temp directory, follow `README.md` exactly, and report every step that fails or is unclear. Fix the docs or setup for each problem. Then run all tests and lint, and write `HANDOFF.md` containing: what works, what is mocked, how to run everything, and a checklist with the real results of each command. Do not mark anything as passing unless you ran it.

---

## APPENDIX A: User flow and backend data flow

### Owner flow
1. Sign up and verify (email or Google).
2. Upload: resume mandatory (PDF or DOCX, size-capped); portfolio URL or pasted text optional. Consent checkbox that approved content is public through the chatbot; choose which contact details are public.
3. Processing screen with progress states and clear errors (scanned PDF, unreadable, oversized).
4. Review, one section at a time (profile, experience, projects, skills, education, certifications, contact). Each item shows value, type tag, source evidence on hover, and a "needs confirmation" flag. Short follow-up questions for ambiguous items. Bot settings (salary and availability policy, tone, resume downloadable). Autosave. Approve is blocked while flags are unresolved unless explicitly skipped.
5. Pick a template (2 to 3), with a live preview.
6. Publish: choose username, indexing runs, user tests the bot in a sandbox with sources visible, then goes live.
7. Dashboard: edit data (new review, re-index changed parts only), toggle bot, view unanswered-questions inbox, view transcripts, delete account and all data.

### Recruiter flow
Opens `/username`, opens the chat widget, asks a question, gets a streamed answer with source labels and resume and contact buttons, can clear the conversation.

### A. Upload and extraction
1. `POST /v1/resumes`: validate size, extension, magic bytes, page count. Store file under `owner_id/uuid`. Create `documents` row and `extraction_jobs` row, enqueue, return 202 with job id. Browser polls `GET /v1/jobs/{id}`.
2. Worker extracts text (PyMuPDF or python-docx) and normalizes. Near-empty text fails with `scanned_pdf`.
3. Injection scan; text always passed to the LLM as delimited data, never as instructions.
4. If a portfolio URL exists: fetch with SSRF protection (block private IP ranges, limit redirects, timeouts, size caps), extract main text, tag `source: portfolio`.
5. LLM extraction with structured output into the Pydantic schema, split into several calls (profile and contact; experience; projects; skills, education, certifications). Every fact carries value, type, and an evidence quote.
6. Programmatic verification: check each evidence quote exists in the source text (fuzzy match), otherwise drop or flag. Date sanity checks. Derive type deterministically from the section where possible; otherwise `listed_only`.
7. Merge resume and portfolio facts, dedupe, flag conflicts.
8. Save as `profile_drafts` (JSONB, version 1, needs_review) with flags. Mark job done.

### B. Review
1. `GET /v1/profile/draft`
2. `PATCH /v1/profile/draft` with a version number to prevent overwrites; Pydantic validates every edit.
3. `POST /v1/profile/followups` saves follow-up answers.
4. `POST /v1/profile/approve` writes an immutable `profile_versions` row and stores a diff against the raw extraction.

### C. Indexing (on approve or publish)
1. Build chunks deterministically from the approved JSON, no LLM: one per job, project, skill group (by type), education entry, certification, plus a contact-and-policy chunk. Each chunk starts with a header such as "Project: X, work experience, 2024". Metadata: owner_id, type, section, entity_id, version.
2. Build the always-in-prompt profile summary from the same data, by template.
3. Compare content hashes with existing chunks; embed only new or changed ones, in batches with retry and backoff.
4. Write the new version's chunks, then flip `active_version` atomically in one transaction.
5. Indexes: HNSW on embedding, GIN on tsvector, btree on owner_id.

### D. Publish and public site
1. `POST /v1/site/publish` takes template, theme, slug (unique, reserved-words check); writes `sites` row and triggers Next.js revalidation.
2. Public page calls `GET /public/sites/{slug}`, returning only public fields of the published version.

### E. Chat, per message
1. `POST /public/chat/stream` with slug, conversation_id, message, Turnstile token. Owner is looked up from the slug on the server; the client never sends an owner id.
2. Guards: Turnstile, rate limits (IP, site, conversation), max message length, daily per-site quota, bot_enabled, global spend breaker.
3. Load or create the conversation and recent history.
4. Route the question: profile, contact, resume, salary or availability, off-topic, injection, smalltalk. Non-profile routes answer from templates and user settings, with no retrieval.
5. Rewrite follow-ups into standalone questions.
6. Embed the question.
7. Hybrid search in SQL: vector top 20 plus keyword top 20, filtered by owner_id and active_version, merged with reciprocal rank fusion, then top 5 or 6 after thresholds and dedupe. Filter by type when the question implies it.
8. If nothing clears the threshold, return "not in the portfolio" with the contact button, with no LLM call.
9. Build the prompt: versioned system template (owner name, rules, tone, salary policy), profile summary, retrieved chunks inside delimiters marked untrusted, history, question. Enforce a token budget.
10. Stream SSE events: `token`, `sources`, `done`, `error`. Tools available: `get_resume_link`, `get_contact`.
11. Grounding check: each claim maps to a chunk or the summary (log-only in v1).
12. Persist the assistant message with chunk ids, prompt version, model, token counts, latency. Log "not in the portfolio" answers to `unanswered_questions`.

### F. Edit, delete, retention
- Edit after publish: new draft, review, approve, then flow C and an atomic flip, then revalidation.
- Account deletion cascades to files, chunks, versions, conversations.
- Scheduled job purges conversations after N days.

### Tenant isolation
Two layers: a repository layer where `owner_id` is a required argument on every method, and Postgres row-level security with the API connecting as a non-superuser role and setting the current owner per transaction (`SET LOCAL app.owner_id`). A service-role connection bypasses RLS and must not be used for request handling. A cross-tenant leak test runs on every CI build.
