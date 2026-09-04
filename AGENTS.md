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
│   │   ├── core/             # Shared API/schemas, permissions, email service, rate limiting
│   │   └── startupdb/        # StartupEntry + Founder models, startup database API
│   ├── config/               # Django settings, urls, api.py (NinjaAPI root)
│   ├── manage.py
│   ├── pyproject.toml        # Python deps (managed with uv)
│   └── Dockerfile            # python:3.13-slim-trixie
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/              # App shell: App.tsx, AppLayout.tsx, provider.tsx, router.tsx, routes/
│   │   ├── components/       # layout/, theme/, three/ (3D background), ui/ (shared UI)
│   │   ├── features/         # about, auth, contact, events, homepage, member, privacy, startups
│   │   ├── lib/api/          # apiFetch wrapper, error normalisation, typed clients
│   │   ├── utils/            # cn.ts, motion.ts
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts      # Frontend test config (jsdom + @testing-library)
│   ├── nginx.conf            # Serves frontend + proxies API in prod
│   └── Dockerfile            # node:24-alpine build stage → nginx:alpine
├── docs/                     # Documentation (specs.md PRD)
├── .github/workflows/deploy.yml  # CI/CD: test → build → GHCR → SSH deploy
├── docker-compose.yml        # Local dev orchestration (frontend, backend, redis)
├── docker-compose.prod.yml   # Prod: pulls pre-built GHCR images + redis (env_file: .env at repo root)
├── evp-website.code-workspace
├── package.json              # ⚠️ Vestigial root manifest (only class-variance-authority) — not a workspace
└── README.md
```

## Tech Stack

### Backend

- **Python ≥ 3.13** (`pyproject.toml`, `backend/Dockerfile`, and CI are all aligned on 3.13), **Django 6.0.5**, **Django Ninja 1.6.2** (REST API, Pydantic validation)
- **Gunicorn** (WSGI server in prod), **uv** for dependency management
- **Ruff** (linter, configured in `backend/pyproject.toml`); dev deps also include **pytest**, **pytest-django**, **hypothesis**, **freezegun** (though tests currently run via `manage.py test`)
- **django-ratelimit** — all API endpoints are rate-limited (per-IP or per-user-or-IP); see decorators on each route. Counts live in the default Django cache: **Redis** (shared across Gunicorn workers) when `CACHE_URL` is set — both compose files set `CACHE_URL=redis://redis:6379/0` against a `redis:7-alpine` service — falling back to per-process `LocMemCache` when unset (single-process local dev/tests only)
- **django-jazzmin** — admin theme (using default config, no custom `JAZZMIN_SETTINGS`)
- DB: MySQL/PyMySQL in prod (psycopg also available as a dep); SQLite (`db.sqlite3`) locally
- Custom `User` model in `apps/accounts/models.py` — email is `USERNAME_FIELD`; `first_name`/`last_name`; **`username` is an auto-generated, globally-unique, immutable user ID** (UUID hex, never the email, never shown in the UI) that keeps a user's activity attributable even if their email changes. Four roles (`member` default, `scout`, `committee`, `admin`), elevated manually via the Django admin. Passwordless **session-based** OTP auth for members: `POST /api/accounts/otp/request` (returns `{exists}` — drives the unified login/signup flow) + `/otp/verify` (returns `{created}`; sets a Django session cookie, no JWT), `POST /api/accounts/logout`, profile `GET /api/accounts/me`, profile update `PATCH /api/accounts/me`, OTP-verified email change `POST /api/accounts/email/change`, member list `GET /api/accounts/members` (admin/committee only), admin send-all-email `POST /api/accounts/sendall`, CSRF bootstrap at `GET /api/csrf`. **OTP codes are stored hashed** (`EmailOTP.code` holds the SHA-256 hex digest, never the plaintext; `EmailOTP.issue()` returns the plaintext exactly once for email delivery) and verified with `secrets.compare_digest` — a DB leak does not expose live codes
- **Admin access**: superusers use a **regular password** (the standard `createsuperuser` flow — `create_superuser(..., password=...)` sets a usable password; member accounts stay passwordless). The Django admin is served at **`/evp-dev/`** (not `/admin/`) via `config/urls.py`, with a redirect from `/evp-dev/login/` to `/`. It uses the standard Django admin site with Jazzmin theming — there is **no custom admin site class** (the `SuperuserOnlyAdminSite` / `AccountsAdminConfig` referenced in earlier docs do not exist). Access is controlled by Django's default `is_staff`/`is_superuser` flags.
- **Email service** (`apps/core/email.py`): uses the **Resend Python SDK** (`resend.Emails.send()`) directly when `RESEND_ENABLED=True`; logs to console when disabled. Emails are wrapped in a shared HTML template (`_build_email_html`). OTP emails, welcome emails, and contact-form emails all flow through `send_email()`. The only Django email backend configured is `console.EmailBackend` under DEBUG (unused by the sending path); there is no SMTP config — all real sending goes through the Resend SDK. **Admin update emails are sanitised twice**: the admin UI renders Markdown to HTML and sanitises it with DOMPurify (`src/features/member/components/widgets/render-markdown.ts`), and `sendall` sanitises the submitted HTML again server-side with **nh3** (`nh3.clean` in `apps/accounts/api.py`) — scripts, event handlers, and `javascript:` URLs never reach member inboxes even via a direct API call.
- Startup database in `apps/startupdb/` — two record types:
  - `Founder`: composite natural key `(first_name, last_name)` (enforced by `unique_founder_name` constraint), `occupation` choices (`bachelors`/`masters`/`phd`/`graduated`), plus `location`, `linkedin`, `email`, `notes`
  - `StartupEntry`: unique `name`, `founders` M2M → `Founder`, `founding_date`, `description`, `website`, `linkedin`, `email`, `location`, `notes`
  - Both carry `created_by` FK → User; the API exposes it as `created_by` = the creator's stable `username` (never the DB id). API under `/api/startupdb` gated by `RoleAuth("scout", "committee", "admin")`; edit/delete via `can_manage_entry` (own records only; admin manages all)

### Frontend

- **React 19**, **TypeScript 6**, **Vite 8**, **React Router 7** (data router via `createBrowserRouter`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`), **Sass**, **framer-motion**, **three.js**
- **TanStack React Query**, **zod**, **lucide-react** / **react-icons**
- Path aliases `@/` → `src/`
- Tooling: ESLint (`simple-import-sort`, react-hooks), Prettier (`prettier-plugin-tailwindcss`)
- Testing: **Vitest** (jsdom environment) with `@testing-library/react` — config in `vitest.config.ts`, setup in `src/setup-tests.ts`
- **Routes** (defined in `src/app/router.tsx`; thin page wrappers in `src/app/routes/`, feature code in `src/features/`):
  - `/` — Home (landing page, hero, highlights)
  - `/about` — About (mission, history, team)
  - `/startups` — Startups (curated showcase, not the internal database)
  - `/events` — Events (upcoming and past)
  - `/contact` — Contact form
  - `/join` — Auth page (unified login/signup: email → OTP code → names if new)
  - `/privacy` — Privacy Policy (static legal copy, collapsible sections)
  - `/terms` — Terms of Service (static legal copy)
  - `/member` — Member dashboard (protected route, role-based widget system)
  - `*` — 404 error page (catch-all loader throws a 404 `Response`)
- **Member dashboard** (`src/features/member/`): hash-based navigation (`/member#<page-id>`), role-filtered widget registry. Pages: Home (welcome + settings), Member List (committee+), Admin (admin only). The Startup Database page is currently commented out of the page registry (`TODO: reimplement`), though `StartupDatabaseWidget` and the `src/lib/api/startupdb.ts` client remain. Widgets defined in `src/features/member/components/widgets/`.
- **Auth flow** (`src/features/auth/`): 3-step animated flow — `EmailStep` → `CodeStep` → `NamesStep` (only for newly created accounts). State managed by the `useAuthFlow` hook; session state by `AuthProvider` (`src/features/auth/components/AuthProvider.tsx`).

### Infrastructure

- Docker + Docker Compose; Nginx serves frontend on port **16017** and proxies to backend (Gunicorn on **17017**)
- Nginx also rate-limits (`limit_req_zone`: global 20r/s, API 5r/s) and handles legacy URL redirects (`/investing` → `/contact#scout-programme`, `/meet-the-team` → `/about#meet-the-team`, `/partners` → `/contact#network`)
- Images pushed to GHCR (repo-scoped): `ghcr.io/forthfora/evp-website/frontend`, `ghcr.io/forthfora/evp-website/backend`
- CI/CD (`.github/workflows/deploy.yml`): on push to `main` → matrix test (frontend lint+build, backend tests) → matrix build-and-push to GHCR (tagged `latest` + commit SHA) → SSH deploy. The deploy script starts the rootless Podman socket, sets `DOCKER_HOST`, logs into GHCR with the `GHCR_DEPLOY_TOKEN` PAT, runs `docker-compose pull && docker-compose up -d --remove-orphans`, then `docker image prune -f`. On PRs: test + build only (no push/deploy). GHA layer caching (`type=gha`) used for faster builds.
- CI uses **Node 24** for frontend, **Python 3.13** for backend (note: the frontend `Dockerfile` builds with `node:24-alpine`)
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
npm run dev        # Vite dev server (proxies /api to http://127.0.0.1:16017)
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
- **API errors**: two shapes — `{"errors": {field: [msgs]}}` (401/403/404/422 from the `config/api.py` handlers) and `{"detail": "..."}` (`HttpError`, e.g. invalid OTP or email-server 500s). The frontend normalises both into `ApiRequestError` (`frontend/src/lib/api/errors.ts`).
- **Frontend API layer**: all fetches go through `apiFetch` (`frontend/src/lib/api/api.ts`), which sends `credentials: 'include'` and attaches `X-CSRFToken` (fetched from `GET /api/csrf`) to mutating requests, retrying once on CSRF rejection (HTML 403 only; JSON 403s are final). Responses are runtime-validated with zod via `requestJson`; both backend error shapes are normalised into `ApiRequestError` (`frontend/src/lib/api/errors.ts`). Typed clients live in `frontend/src/lib/api/{contact,startupdb}.ts` and `frontend/src/features/auth/api/api.ts`; the session auth provider is `frontend/src/features/auth/components/AuthProvider.tsx`.
- **Frontend features**: each feature lives in `src/features/<name>/` (components, hooks, API clients); thin route wrappers live in `src/app/routes/` and are registered in `src/app/router.tsx` under `AppLayout`; unknown paths throw a 404 `Response` from the catch-all loader.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge` via the `cn()` utility at `src/utils/cn.ts`. Use `cva` (class-variance-authority) for component variants. No new CSS files — extract repeated Tailwind patterns into React components in `src/components/ui/`. No `@apply` in CSS. Route files should contain only composition and data assembly, not inline component definitions.
- **Lint/format before committing**: `npm run lint` and `npm run format` must pass.
- **Env vars**: in local dev the backend reads from `backend/.env` (python-decouple; the dev compose mounts `./backend` to `/app` so the file is found there). In production, `docker-compose.prod.yml` uses `env_file: .env` at the **repo root** on the server. Both compose files additionally set `CACHE_URL=redis://redis:6379/0` directly in the backend service `environment:` (not a secret). Never commit `.env` (note: there is no root `.gitignore` — see Known Issues).
- **Static files**: backend `collectstatic` output goes to the shared `django_static` Docker volume; Nginx serves it — don't change the volume wiring without updating both `docker-compose.yml` and `frontend/nginx.conf`.
- Don't edit `backend/staticfiles/` (generated artifacts).

## Known Issues & Discrepancies

Findings from the 2026-09 project-wide review. Previously listed items (Python 3.12 Dockerfile, missing `MEDIA_URL`/`MEDIA_ROOT`, unused `PyJWT`/`django-redis`, SMTP dead code, `docs/adr/` references, unused `/admin/` Nginx proxy, contact-form HTML injection, per-process rate limits, OTP codes stored plaintext, unsanitised Markdown in admin update emails, email schemas accepting any string) have been resolved and removed.

### Security

- **No HSTS** (`SECURE_HSTS_SECONDS` unset in Django) and **no security headers in Nginx** (no CSP, `X-Content-Type-Options`, `Referrer-Policy`, etc.).

### Correctness / robustness

- **`verify_otp` race**: `User.objects.get_or_create(email=...)` can raise `IntegrityError` under concurrent verifies of the same new email → 500.
- **No pagination** on `GET /api/accounts/members`, `GET /api/startupdb/`, `GET /api/startupdb/founders` (full-table serialisation); `sendall` does one greeting-lookup query per recipient (N+1).
- **`founder_ids` are not ownership-checked**: any scout can attach another scout's founder records to their own startup entry (reading all founders' emails/LinkedIn is by-design for the role).

### Dead / stale code & tooling

- **Startup Database dashboard page is commented out** of the member page registry (`TODO: reimplement`), while `StartupDatabaseWidget` and the full `src/lib/api/startupdb.ts` client remain — the API is live but unreachable from the UI.
- **`RoleRoute` is exported but unused** (role gating happens via the widget registry).
- **`robots.txt` disallows `/admin/` and `/dashboard/`** — neither path exists (admin is `/evp-dev/`, dashboard is `/member/`); `/member` and `/evp-dev/` are not disallowed. **`sitemap.xml` omits `/join`, `/privacy`, `/terms`**.
- **`AuthProvider.test.tsx` mocks `@/lib/auth/api`**, a module path that no longer exists (real path: `@/features/auth/api/api`) — the mocks are no-ops and the tests pass only via the global fetch stub.
- **Root `package.json` is vestigial** (only `class-variance-authority`; no scripts/workspaces) — `cva` belongs in `frontend/package.json`.
- **No root `.gitignore`**: only `backend/` and `frontend/` have one. The prod compose file reads `env_file: .env` from the repo root on the server — a root `.env` created locally would not be ignored.
- **Node version mismatch**: the frontend `Dockerfile` builds with `node:24-alpine` while CI (`deploy.yml`) uses Node 24.
- **Prod deploys pull `:latest`**: CI publishes both `latest` and commit-SHA tags, but `docker-compose.prod.yml` references only `:latest` — SHA tags are unused and rollbacks require manual retagging. GitHub Actions are pinned by major tag (not commit SHA), and `backend/Dockerfile` copies uv from `ghcr.io/astral-sh/uv:latest` — supply-chain hardening opportunities.
- **`psycopg` is a declared dependency** but no Postgres database branch exists (MySQL or SQLite only).

## Common Gotchas & Fixes

### Production / CI/CD

- **`docker-compose up -d` fails with `CNI network "evp-website_default" not found`**
  - Cause: Podman on Tardis uses CNI with `cniVersion: 1.0.0` in the conflist, but `docker-compose` v1 expects `0.4.0`.
  - Fix: Edit `~/.config/cni/net.d/<compose-project-name>.conflist` and change `"cniVersion": "1.0.0"` → `"0.4.0"`, then re-run `docker-compose up -d`.
  - The compose project name is typically the directory name — e.g. `evp-website_default.conflist`.

- **SSH deploy works but `docker-compose` fails with `PermissionError(13, 'Permission denied')`**
  - The server uses Podman rootless (no `/var/run/docker.sock`). The deploy script runs `systemctl --user start podman.socket` and sets `DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock` before invoking `docker-compose`.
