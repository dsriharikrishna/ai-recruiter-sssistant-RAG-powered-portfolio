# Contributing Guidelines

We welcome contributions to the AI Recruiter Assistant project. To maintain system reliability, security, and tenant isolation, all contributors must adhere to the following rules:

---

## 1. The Tenant Isolation Rule (Zero Exceptions)

This is a multi-tenant application. Data leakage between candidates is a critical severity failure:
1. **Repository Layer**: Every repository query and mutation must accept `owner_id: uuid.UUID` as an explicit argument and filter queries by `owner_id`. No method may query tenant data without an `owner_id`.
2. **Database Row Level Security (RLS)**: Every tenant table must have Postgres RLS enabled with `FORCE ROW LEVEL SECURITY`. Connection sessions must set `SET LOCAL app.owner_id = '<uuid>'`.
3. **Cross-Tenant Leak Tests**: Any changes affecting database models or repositories must run and pass the isolation tests (`test_repositories.py`).

---

## 2. The Schema-Change Rule

1. The canonical definition of candidate profile data is [apps/api/app/schemas/profile.py](apps/api/app/schemas/profile.py).
2. Whenever modifying `profile.py`:
   - Regenerate the JSON Schema: run the schema exporter script to update `docs/profile.schema.json`.
   - Update the database models in `app/models/models.py` and generate an Alembic migration (`alembic revision --autogenerate -m "..."`).
   - Regenerate the OpenAPI spec (`docs/openapi.json`) and TypeScript types (`pnpm --filter web gen:api`).

---

## 3. Pull Request Requirements

- **Keep PRs Small**: Aim for PRs under 400 lines of changes covering a single concern.
- **Single Reviewer**: Every PR requires approval from at least one reviewer.
- **CI Required Checks**:
  - `ruff` lint and format
  - `mypy` strict type checking
  - `pytest` including tenant isolation and leak verification
  - `pnpm lint` and `tsc --noEmit`
  - `vitest` unit tests

---

## 4. AI Behavior Changes Require Eval Results

Any modifications to extraction prompts, models, chunking logic, or chat generation must include before/after evaluation run results in the PR description:
```bash
uv run python -m app.evals.run
```
The pull request will be blocked if:
- `invented_items > 0` (zero hallucinations target).
- `field_accuracy` decreases against the baseline fixtures.

