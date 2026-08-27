# Phase 1: Configuration and version alignment

- **Goal**: fix the env-inconsistencies so local, CI, and production agree on
  ports, Python version, and enabled features
- **Depends on**: none
- **Risk level**: low
- **Files affected**:
  - `backend/Dockerfile`
  - `backend/config/settings.py` (CSRF trusted origins)
  - `backend/config/urls.py` (remove MEDIA static pattern)
  - `backend/pyproject.toml` (PyJWT, django-redis)
  - `frontend/nginx.conf` (remove `/admin/` proxy)
- **Changes**:
  1. Bump `backend/Dockerfile` base image `python:3.12-slim-trixie` →
     `python:3.13-slim-trixie`. Resolves R8-1.
  2. Update `CSRF_TRUSTED_ORIGINS` to use port 16017; keep DEBUG additions
     for Vite (5173). Resolves R8-3.
  3. Remove the `static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)`
     pattern from `backend/config/urls.py` or define MEDIA settings in
     `settings.py`. Recommend removal: no uploads exist. Resolves R8-7.
  4. Remove `PyJWT` and `django-redis` from `backend/pyproject.toml` and run
     `uv sync` to refresh `uv.lock`. Resolves R8-2.
  5. Remove the unused `/admin/` proxy block in `frontend/nginx.conf` (keep
     `/evp-dev/`). Resolves R8-6.
- **Functionality preservation**:
  - Every change is a config/deps-only no-op for behaviour at runtime.
    Project still boots and serves, no source changes.
  - Anything referencing `PyJWT`/`django-redis` (none) breaks — verify
    beforehand with `uv run ruff check` and a grep.
- **Verification**:
  - `docker compose up --build` succeeds; site loads on
    http://localhost:16017
  - `uv run python manage.py check` passes
  - `uv run python manage.py test` full backend suite passes
  - `npm run build` and `npm run lint` succeed on frontend
  - Manual: log in via local frontend; CSRF flow completes (R8-3)
- **Rollback**:
  - Revert each file in git; no cross-file dependency between changes
    makes granular rollback straightforward.
