# AI Recruiter Assistant - RAG-Powered Portfolio Builder

Setup plan for a multi-tenant portfolio builder with a RAG recruiter chatbot.

## Architecture & Monorepo Structure

- `apps/web`: Next.js 16 (App Router, React 19, TypeScript strict mode, Tailwind CSS v4, TanStack Query, shadcn/ui utilities, ESLint, Prettier).
- `apps/api`: FastAPI (Python 3.12, Pydantic v2, uv, Ruff, Mypy, Pytest).
- `docs/`: Technical documentation and architecture records.

## Tooling & Development

- Python package management: `uv`
- JavaScript package management: `pnpm` workspaces
- Quality checks: Ruff, Mypy, ESLint, Prettier, pre-commit

### Common Commands

```bash
# Install dependencies
make install

# Run linting
make lint

# Run tests
make test
```
