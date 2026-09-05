FROM python:3.13-slim-trixie
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Dedicated non-root user (uid/gid 1000) for the app
RUN groupadd -g 1000 app && useradd -u 1000 -g 1000 -m app

WORKDIR /app

ENV UV_NO_DEV=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN chown app:app /app
COPY --chown=app:app pyproject.toml uv.lock ./
USER app
RUN uv sync --frozen --no-install-project

COPY --chown=app:app . .
RUN uv sync --frozen

RUN mkdir -p /app/staticfiles

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD /app/.venv/bin/python -c "import socket; socket.create_connection(('127.0.0.1', 17017), timeout=4)"

CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:17017"]