# --- STAGE 1: Build Stage ---
FROM python:3.14-slim AS builder

# Copy the uv binary directly from the official distroless image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation for faster app cold starts
ENV UV_COMPILE_BYTECODE=1
# Tell uv to copy files instead of hard-linking (vital for Docker layer systems)
ENV UV_LINK_MODE=copy

# Copy only the dependency sheets first for optimal Docker layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtual environment (.venv) without the actual app code
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Copy the rest of your Django source code
COPY . .

# Run sync again to install the app itself
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


# --- STAGE 2: Runtime Stage ---
FROM python:3.12-slim AS runtime

WORKDIR /app

# Inject the virtual environment created by uv directly into the system PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy the built virtual environment and application code from Stage 1
COPY --from=builder /app /app

EXPOSE 8000

# Run your Django application (System Python defaults to the active virtual environment on PATH)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]