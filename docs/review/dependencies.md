# Dependency Hygiene Review

## Summary

The dependency set includes genuinely-unused packages (PyJWT, django-redis), a Python / Dockerfile mismatch, a missing frontend package-lock vs GHCR pattern, and a stray `MEDIA_URL`/`MEDIA_ROOT` reference. Nginx-level proxying for `/admin/` is unused (the Django admin is at `/evp-dev/`).

## Findings

### R8-1 — Python version mismatch (Dockerfile vs pyproject)
- **Location**: [backend/Dockerfile](backend/Dockerfile#L1),
  [backend/pyproject.toml](backend/pyproject.toml#L5)
- **Description**: `pyproject.toml` requires `>=3.13` but the Dockerfile
  uses `python:3.12-slim-trixie`. CI uses Python 3.13.
- **Severity**: high
- **Evidence**: AGENTS.md known issue #1.
- **Recommendation**: bump the Dockerfile to `python:3.13-slim-trixie`.

### R8-2 — `PyJWT` and `django-redis` unused
- **Location**: [backend/pyproject.toml](backend/pyproject.toml#L16-L25)
- **Description**: Neither `PyJWT` nor `django-redis` is referenced by
  source (grep across `backend/apps` finds no references). Both should be
  removed.
- **Severity**: medium
- **Evidence**: no matches via grep for `jwt|redis`.
- **Recommendation**: remove from `pyproject.toml` and re-lock via `uv sync`.

### R8-3 — Frontend runs on 16017, `CSRF_TRUSTED_ORIGINS` lists 16016
- **Location**: [backend/config/settings.py](backend/config/settings.py#L44-L48)
- **Description**: CSRF/CORS trusted origin list should use the actual
  frontend port (see R7-2).
- **Severity**: medium
- **Evidence**: hard-coded `16016` port.
- **Recommendation**: fix `CSRF_TRUSTED_ORIGINS` in env/config.

### R8-4 — SMTP email settings are misleading
- **Location**: [backend/config/settings.py](backend/config/settings.py#L85-L97)
- **Description**: SMTP settings configured but unused (R3-1) — settings
  hygiene issue.
- **Severity**: medium
- **Evidence**: actual sending is via Resend Python SDK.
- **Recommendation**: remove SMTP settings block; document that Resend SDK
  handles sending.

### R8-5 — pytest/pytest-django/freezegun/hypothesis declared dev-deps but runner is Django
- **Location**: [backend/pyproject.toml](backend/pyproject.toml#L27-L32), [backend/pyproject.toml](backend/pyproject.toml#L34-L40)
- **Description**: tests run with `uv run python manage.py test`; pytest is
  never invoked. Declaring pytest/pytest-django/freezegun/hypothesis leads
  to a misleading dev-deps block.
- **Severity**: medium
- **Evidence**: AGENTS.md notes tests run via `manage.py test`.
- **Recommendation**: either remove pytest/pytest-django or switch runner
  to `uv run pytest`. Coordinate with R5-3.

### R8-6 — `/admin/` proxy in nginx.conf unused
- **Location**: [frontend/nginx.conf](frontend/nginx.conf#L60-L67)
- **Description**: Nginx proxies `/admin/` to backend, but Django admin is
  served at `/evp-dev/` and `nginx.conf` also has a route for `/evp-dev/`.
- **Severity**: low
- **Evidence**: known issue #8 in AGENTS.md.
- **Recommendation**: remove the `/admin/` proxy block; keep `/evp-dev/`.

### R8-7 — `MEDIA_URL` / `MEDIA_ROOT` referenced but not defined
- **Location**: [backend/config/urls.py](backend/config/urls.py#L40-L42)
- **Description**: `settings.MEDIA_URL` / `settings.MEDIA_ROOT` are
  referenced in DEBUG block but neither is set in `settings.py`. DEBUG path
  will crash on import.
- **Severity**: medium
- **Evidence**: known issue #2 in AGENTS.md.
- **Recommendation**: remove the media URL pattern (no uploads in current
  features) or define the settings in `settings.py`.

### R8-8 — AUTHORS
- **Location**: n/a
- **Description**: no media files in the project; taking `static(MEDIA_URL, MEDIA_ROOT)` dead code is good cleanup, but should be verified.
- **Severity**: low
- **Recommendation**: same as R8-7 — remove pattern.
