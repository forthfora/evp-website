# AGENTS.md — Edinburgh VenturePoint Website

Guidance for autonomous code agents working in this repository.

## Project Overview

Official website for **Edinburgh VenturePoint (EVP)**, an entrepreneurship society at the University of Edinburgh.
Live site: https://edinburghventurepoint.com — hosted on Tardis servers (https://tardisproject.uk).

## Repository Layout

```
evp-website/
├── backend/                  # Django + Django Ninja API
│   ├── apps/
│   │   ├── accounts/         # Custom User model (4 roles), passwordless OTP auth API
│   │   ├── core/             # Shared API/schemas, permissions, email service
│   │   └── startupdb/        # StartupEntry + Founder models, startup database API
│   ├── config/               # Django settings, urls, api.py (NinjaAPI root)
│   ├── helpers/exceptions.py
│   ├── manage.py
│   ├── pyproject.toml        # Python deps (managed with uv)
│   └── Dockerfile            # ⚠️ Uses Python 3.12; pyproject.toml requires >=3.13
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/              # app-layout, app.tsx, browser-router.tsx, app.css
│   │   ├── pages/            # home, about, contact, events, startups, auth, member, ErrorPage
│   │   └── shared/           # assets, lib (api clients, auth, errors), styles, ui
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts      # Frontend test config (jsdom + @testing-library)
│   ├── nginx.conf            # Serves frontend + proxies API in prod
│   └── Dockerfile
├── docs/                     # Documentation (specs.md PRD, todo-accounts-fixes.md)
├── .github/workflows/deploy.yml  # CI/CD: test → build → GHCR → SSH deploy
├── docker-compose.yml        # Local dev orchestration
├── docker-compose.prod.yml   # Prod: pulls pre-built GHCR images
├── evp-website.code-workspace
└── README.md
```

## Tech Stack

### Backend

- **Python ≥ 3.13** (per `pyproject.toml`; note: the backend `Dockerfile` currently uses `python:3.12-slim-trixie` — a known discrepancy), **Django 6.0.5**, **Django Ninja 1.6.2** (REST API, Pydantic validation)
- **Gunicorn** (WSGI server in prod), **uv** for dependency management
- **Ruff** (linter, configured in `backend/pyproject.toml`); dev deps also include **pytest**, **pytest-django**, **hypothesis**, **freezegun** (though tests currently run via `manage.py test`)
- **django-ratelimit** — all API endpoints are rate-limited (per-IP or per-user-or-IP); see decorators on each route
- **django-jazzmin** — admin theme (using default config, no custom `JAZZMIN_SETTINGS`)
- DB: MySQL/PyMySQL in prod (psycopg also available as a dep); SQLite (`db.sqlite3`) locally
- Custom `User` model in `apps/accounts/models.py` — email is `USERNAME_FIELD`; `first_name`/`last_name`; **`username` is an auto-generated, globally-unique, immutable user ID** (UUID hex, never the email, never shown in the UI) that keeps a user's activity attributable even if their email changes. Four roles (`member` default, `scout`, `committee`, `admin`), elevated manually via the Django admin. Passwordless **session-based** OTP auth for members: `POST /api/accounts/otp/request` (returns `{exists}` — drives the unified login/signup flow) + `/otp/verify` (returns `{created}`; sets a Django session cookie, no JWT), `POST /api/accounts/logout`, profile `GET /api/accounts/me`, profile update `PATCH /api/accounts/me`, OTP-verified email change `POST /api/accounts/email/change`, member list `GET /api/accounts/members` (admin/committee only), admin send-all-email `POST /api/accounts/sendall`, CSRF bootstrap at `GET /api/csrf`
- **Admin access**: superusers use a **regular password** (the standard `createsuperuser` flow — `create_superuser(..., password=...)` sets a usable password; member accounts stay passwordless). The Django admin is served at **`/evp-dev/`** (not `/admin/`) via `config/urls.py`, with a redirect from `/evp-dev/login/` to `/`. It uses the standard Django admin site with Jazzmin theming — there is **no custom admin site class** (the `SuperuserOnlyAdminSite` / `AccountsAdminConfig` referenced in earlier docs do not exist). Access is controlled by Django's default `is_staff`/`is_superuser` flags.
- **Email service** (`apps/core/email.py`): uses the **Resend Python SDK** (`resend.Emails.send()`) directly when `RESEND_ENABLED=True`; logs to console when disabled. Emails are wrapped in a shared HTML template (`_build_email_html`). OTP emails, welcome emails, and contact-form emails all flow through `send_email()`. Note: `settings.py` also configures an SMTP backend for non-DEBUG mode, but the actual sending code uses the Resend SDK, not Django's email backend.
- Startup database in `apps/startupdb/` — two record types:
  - `Founder`: composite natural key `(first_name, last_name)` (enforced by `unique_founder_name` constraint), `occupation` choices (`bachelors`/`masters`/`phd`/`graduated`), plus `location`, `linkedin`, `email`, `notes`
  - `StartupEntry`: unique `name`, `founders` M2M → `Founder`, `founding_date`, `description`, `website`, `linkedin`, `email`, `location`, `notes`
  - Both carry `created_by` FK → User; the API exposes it as `created_by` = the creator's stable `username` (never the DB id). API under `/api/startupdb` gated by `RoleAuth("scout", "committee", "admin")`; edit/delete via `can_manage_entry` (own records only; admin manages all)

### Frontend

- **React 19**, **TypeScript 6**, **Vite 8**, **React Router 7** (data router via `createBrowserRouter`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`), **Sass**, **framer-motion**, **three.js**
- **TanStack React Query**, **zod**, **lucide-react** / **react-icons**
- Path aliases `@/` → `src/`, `@assets/` → `src/shared/assets`, `@common/` → `src/shared/ui/common`
- Tooling: ESLint (`simple-import-sort`, react-hooks), Prettier (`prettier-plugin-tailwindcss`)
- Testing: **Vitest** (jsdom environment) with `@testing-library/react` — config in `vitest.config.ts`, setup in `src/test-setup.ts`
- **Routes** (defined in `src/app/browser-router.tsx`):
  - `/` — Home (landing page, hero, highlights)
  - `/about` — About (mission, history, team)
  - `/startups` — Startups (curated showcase, not the internal database)
  - `/events` — Events (upcoming and past)
  - `/contact` — Contact form
  - `/join` — Auth page (unified login/signup: email → OTP code → names if new)
  - `/member` — Member dashboard (protected route, role-based widget system)
  - `*` — 404 error page
- **Member dashboard** (`src/pages/member/`): hash-based navigation (`/member#startups`), role-filtered widget registry. Pages: Home (welcome + settings), Startup Database (scout+), Member List (committee+), Admin (admin only). Widgets defined in `src/pages/member/widgets/`.
- **Auth flow** (`src/pages/auth/`): 3-step animated flow — `EmailStep` → `CodeStep` → `NamesStep` (only for newly created accounts). State managed by `useAuthFlow` hook.

### Infrastructure

- Docker + Docker Compose; Nginx serves frontend on port **16017** and proxies to backend (Gunicorn on **17017**)
- Nginx also rate-limits (`limit_req_zone`: global 20r/s, API 5r/s) and handles legacy URL redirects (`/investing` → `/contact#scout-programme`, `/meet-the-team` → `/about#meet-the-team`, `/partners` → `/contact#network`)
- Images pushed to GHCR (repo-scoped): `ghcr.io/forthfora/evp-website/frontend`, `ghcr.io/forthfora/evp-website/backend`
- CI/CD (`.github/workflows/deploy.yml`): on push to `main` → matrix test (frontend lint+build, backend tests) → matrix build-and-push to GHCR (tagged `latest` + commit SHA) → SSH deploy via `docker-compose pull && up -d`. On PRs: test + build only (no push/deploy). GHA layer caching (`type=gha`) used for faster builds.
- CI uses **Node 22** for frontend, **Python 3.13** for backend
- Deploy secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `GHCR_DEPLOY_TOKEN`

## Common Commands

### Full stack (recommended for local dev)

```sh
cp backend/.env.example backend/.env   # first-time setup
docker compose up --build
```

- Site: http://localhost:16017
- Admin: http://localhost:16017/evp-dev/
- API docs (Ninja): http://localhost:16017/api/docs

### Backend (standalone, inside container or venv)

```sh
cd backend
uv sync                                # install deps
uv run python manage.py migrate
uv run python manage.py runserver
uv run python manage.py createsuperuser
uv run python manage.py test           # run tests
uv run ruff check                       # lint all Python files
uv run ruff check --fix                 # lint + auto-fix
```

### Frontend (standalone)

```sh
cd frontend
npm install
npm run dev        # Vite dev server (proxies /api to localhost:8000)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

## Conventions & Gotchas

- **Backend code style**: modern typing (`from __future__ import annotations`, PEP 695 generics e.g. `class UserManager[T]`), type hints everywhere. Linted with **Ruff** — run `uv run ruff check` before committing.
- **Run backend commands with `uv run`**: always prefix Python commands with `uv run` (e.g. `uv run python manage.py migrate`, `uv run pytest`, `uv run ruff check`). Never invoke `python` or `.venv\Scripts\python.exe` directly — `uv run` resolves the correct venv automatically.
- **API**: register routers in `backend/config/api.py`; URL prefix `/api/`. Schemas live next to apps (e.g. `apps/core/schemas.py`).
- **API errors**: two shapes — `{"errors": {field: [msgs]}}` (401/403/404/422 from the `config/api.py` handlers) and `{"detail": "..."}` (`HttpError`, e.g. invalid OTP or email-server 500s). The frontend normalises both into `ApiRequestError` (`frontend/src/shared/lib/errors.ts`).
- **Frontend API layer**: all fetches go through `apiFetch` (`frontend/src/shared/lib/api.ts`), which sends `credentials: 'include'` and attaches `X-CSRFToken` (fetched from `GET /api/csrf`) to mutating requests, retrying once on CSRF rejection. Typed clients live in `frontend/src/shared/lib/{auth,contact,startupdb}/api.ts`; the session auth provider is `frontend/src/shared/lib/auth/auth-context.tsx`.
- **Frontend pages**: each page lives in `src/pages/<name>/<Name>Page.tsx`; add routes in `src/app/browser-router.tsx` wrapped by `AppLayout`; unknown paths throw a 404 `Response`.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge`.
- **Lint/format before committing**: `npm run lint` and `npm run format` must pass.
- **Env vars**: backend reads from `backend/.env` (python-decouple). Never commit `.env`.
- **Static files**: backend `collectstatic` output goes to the shared `django_static` Docker volume; Nginx serves it — don't change the volume wiring without updating both `docker-compose.yml` and `frontend/nginx.conf`.
- Don't edit `backend/staticfiles/` (generated artifacts).

## Known Issues & Discrepancies

These are known issues in the current codebase that a future refactor should address:

- **Python version mismatch**: `backend/pyproject.toml` requires `>=3.13`, but `backend/Dockerfile` uses `python:3.12-slim-trixie`. CI uses Python 3.13. The Dockerfile should be updated to `python:3.13-slim-trixie`.
- **Missing `MEDIA_URL` / `MEDIA_ROOT`**: `config/urls.py` references `settings.MEDIA_URL` and `settings.MEDIA_ROOT` in DEBUG mode, but neither is defined in `config/settings.py`. This will crash if `DEBUG=True` and the URL config is loaded. Either define them or remove the media URL pattern.
- **CSRF_TRUSTED_ORIGINS port mismatch**: `config/settings.py` lists `http://localhost:16016` in `CSRF_TRUSTED_ORIGINS`, but the frontend is served on port `16017`. This should be `16017`.
- **Unused dependencies**: `PyJWT` and `django-redis` are listed in `backend/pyproject.toml` but are not currently used (auth is session-based with no JWT; no Redis cache is configured in settings).
- **Email backend mismatch**: `settings.py` configures Django's SMTP email backend for non-DEBUG mode, but `apps/core/email.py` actually sends via the Resend Python SDK directly. The SMTP config is dead code.
- **`docs/adr/` directory does not exist**: Both `specs.md` and earlier versions of this file referenced ADRs under `docs/adr/` (e.g. `0001`, `0002`), but that directory was never created. The ADR references should be removed or the ADRs should be written.
- **`User.image` field does not exist**: `specs.md` §9 references "the existing `User.image` field" for future member profile pages, but the `User` model has no `image` field.
- **Admin URL is `/evp-dev/`, not `/admin/`**: The Django admin is served at `/evp-dev/` (configured in `config/urls.py`). Nginx proxies `/admin/` to the backend, but Django routes it to `/evp-dev/`. The `/admin/` proxy in `nginx.conf` is currently unused.

## Common Gotchas & Fixes

### Production / CI/CD

- **`docker-compose up -d` fails with `CNI network "evp-website_default" not found`**
  - Cause: Podman on Tardis uses CNI with `cniVersion: 1.0.0` in the conflist, but `docker-compose` v1 expects `0.4.0`.
  - Fix: Edit `~/.config/cni/net.d/<compose-project-name>.conflist` and change `"cniVersion": "1.0.0"` → `"0.4.0"`, then re-run `docker-compose up -d`.
  - The compose project name is typically the directory name — e.g. `evp-website_default.conflist`.

- **SSH deploy works but `docker-compose` fails with `PermissionError(13, 'Permission denied')`**
  - The server uses Podman rootless (no `/var/run/docker.sock`). The deploy script must set `DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock` and `DOCKER_CONFIG=$XDG_RUNTIME_DIR/containers`.
