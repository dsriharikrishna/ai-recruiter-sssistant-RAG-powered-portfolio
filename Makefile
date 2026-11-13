.PHONY: install dev test lint migrate down

install:
	uv sync --directory apps/api --extra dev
	pnpm install

dev:
	@echo "Starting development servers..."
	pnpm --filter web dev & uv run --directory apps/api uvicorn app.main:app --reload --port 8000

test:
	uv run --directory apps/api pytest
	pnpm --filter web exec tsc --noEmit

lint:
	uv run --directory apps/api ruff check .
	uv run --directory apps/api mypy app tests
	pnpm --filter web lint
	pnpm --filter web exec prettier --check "src/**/*.{ts,tsx,css}"

migrate:
	uv run --directory apps/api alembic upgrade head

down:
	docker compose down -v

