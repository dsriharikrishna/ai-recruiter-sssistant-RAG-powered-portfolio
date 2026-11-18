# AI Recruiter Assistant — RAG-Powered Portfolio Platform

A multi-tenant portfolio builder where candidates upload their resumes or portfolios to generate a verified, public profile and a recruiter-facing AI chatbot. The chatbot answers questions strictly grounded in the candidate's verified background and refuses out-of-scope or unverified claims.

---

## Architecture Overview

- **Backend (`services/backend`)**: FastAPI async web application, SQLAlchemy 2.0 with PostgreSQL + pgvector (HNSW) and tsvector (BM25 hybrid search), Redis caching, Alembic migrations, and strict tenant isolation via Postgres Row Level Security (RLS).
- **Frontend (`services/frontend`)**: Next.js 16 (App Router), React 19, TypeScript strict mode, TanStack Query, Tailwind CSS, auto-generated OpenAPI typed client, and Server-Sent Events (SSE) streaming recruiter chat widget.
- **Infrastructure (`infra/`)**: Independent docker-compose setups for data services (PostgreSQL + pgvector, Redis) and isolated backend/frontend containers.
- **Evaluation Harness (`services/backend/app/evals`)**: Deterministic evaluation framework verifying zero invented facts and 100% field extraction accuracy across resume fixtures.

---

## Quickstart & Setup

### 1. Prerequisites
- Python 3.12+ and [uv](https://github.com/astral-sh/uv)
- Node.js 20+ and npm (Docker image builds use pnpm internally)
- Docker & Docker Compose (optional for local full-stack run)

### 2. Clone and Configure Environment
```bash
git clone https://github.com/dsriharikrishna/ai-recruiter-sssistant-RAG-powered-portfolio.git
cd ai-recruiter-sssistant-RAG-powered-portfolio

# Copy environment configuration
cp .env.example .env
```

### 3. Docker Compose (One-Command Startup)
```bash
make up
make migrate
```
To stop the services:
```bash
make down
```

### 4. Local Development Without Docker

#### Backend (`services/backend`)
```bash
cd services/backend
# Install dependencies
uv sync --extra dev

# Run migrations (ensure local Postgres is running with pgvector)
uv run alembic upgrade head

# Start API dev server on http://localhost:8000
uv run uvicorn app.main:app --reload --port 8000
```

#### Frontend (`services/frontend`)
```bash
cd services/frontend
# Install dependencies
npm install

# Start Next.js dev server on http://localhost:3000
npm run dev
```

---

## Testing & Quality Gates

Run the entire verification suite:
```bash
# Run all unit tests, linters, and type checkers across services
make test
```

Or run per-service:
```bash
# Backend checks
cd services/backend
uv run ruff check app tests
uv run mypy --config-file pyproject.toml app tests
uv run pytest tests
uv run python -m app.evals.run

# Frontend checks
cd services/frontend
npx tsc --noEmit
npm run lint
npm run test:unit
/////
```

---

## Application URLs
- **Web Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Login / Dev Auth**: [http://localhost:3000/login](http://localhost:3000/login)
- **Sample Candidate Profile**: [http://localhost:3000/alex-johnson](http://localhost:3000/alex-johnson)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health / Readiness**: [http://localhost:8000/health](http://localhost:8000/health) and [http://localhost:8000/ready](http://localhost:8000/ready)
