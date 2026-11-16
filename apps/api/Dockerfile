FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy project specification files
COPY pyproject.toml README.md ./

# Install dependencies using uv
RUN uv sync --frozen --no-install-project || uv sync --no-install-project

# Copy application source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start development server with reload
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

