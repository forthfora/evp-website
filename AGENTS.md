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
│   └── Dockerfile
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/              # app-layout, app.tsx, browser-router.tsx, app.css
│   │   ├── pages/            # home, about, contact, events, startups, ErrorPage
│   │   └── shared/           # assets, lib, styles, ui
│   ├── package.json
│   ├── vite.config.ts
│   ├── nginx.conf            # Serves frontend + proxies API in prod
│   └── Dockerfile
├── docs/                     # Documentation (contains specs.md PRD)
├── .github/workflows/deploy.yml  # CI/CD: build → GHCR → SSH deploy
├── docker-compose.yml        # Local dev orchestration
├── docker-compose.prod.yml
├── evp-website.code-workspace
└── README.md
```

## Tech Stack

### Backend

- **Python ≥ 3.13**, **Django 6**, **Django Ninja 1.6** (REST API, Pydantic validation)
- **Gunicorn** (WSGI server in prod), **uv** for dependency management
- **Ruff** (linter, configured in `backend/pyproject.toml`)
- DB: MySQL/PyMySQL in prod (psycopg also available); SQLite (`db.sqlite3`) locally
- Custom `User` model in `apps/accounts/models.py` — email is `USERNAME_FIELD`; no first/last name. Four roles (`member` default, `scout`, `committee`, `admin`), elevated manually via the Django admin; passwordless OTP auth (see `docs/adr/0001-passwordless-auth.md`)
- Startup database in `apps/startupdb/` — two record types (see `docs/adr/0002-roles-startupdb-and-admin-comms.md`):
  - `Founder`: composite natural key `(first_name, last_name)`, `occupation` choices (`bachelors`/`masters`/`phd`/`graduated`), plus `location`, `linkedin`, `email`, `notes`
  - `StartupEntry`: unique `name`, `founders` M2M → `Founder`, `founding_date`, `description`, `website`, `linkedin`, `email`, `location`, `notes`
  - Both carry `created_by` FK → User; API under `/api/startupdb` gated by `require_role("scout", "committee", "admin")`; edit/delete via `can_manage_entry` (own records only; admin manages all)

### Frontend

- **React 19**, **TypeScript**, **Vite 8**, **React Router 7** (data router via `createBrowserRouter`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`), **Sass**, **framer-motion**, **three.js**
- **TanStack React Query**, **zod**, **lucide-react** / **react-icons**
- Path alias `@/` → `src/`
- Tooling: ESLint (`simple-import-sort`, react-hooks), Prettier (`prettier-plugin-tailwindcss`)

### Infrastructure

- Docker + Docker Compose; Nginx serves frontend on port **16017** and proxies to backend (Gunicorn on **17017**)
- Images pushed to GHCR (repo-scoped): `ghcr.io/forthfora/evp-website/frontend`, `ghcr.io/forthfora/evp-website/backend`
- CI/CD (`.github/workflows/deploy.yml`): on push to `main` → matrix build of frontend+backend → push to GHCR → SSH deploy via `docker compose pull && up -d`
- Deploy secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `GHCR_DEPLOY_TOKEN`

## Common Commands

### Full stack (recommended for local dev)

```sh
cp backend/.env.example backend/.env   # first-time setup
docker compose up --build
```

- Site: http://localhost:16017
- Admin: http://localhost:16017/admin/
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
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run format     # Prettier
```

## Conventions & Gotchas

- **Backend code style**: modern typing (`from __future__ import annotations`, PEP 695 generics e.g. `class UserManager[T]`), type hints everywhere. Linted with **Ruff** — run `uv run ruff check` before committing.
- **Run backend commands with `uv run`**: always prefix Python commands with `uv run` (e.g. `uv run python manage.py migrate`, `uv run pytest`, `uv run ruff check`). Never invoke `python` or `.venv\Scripts\python.exe` directly — `uv run` resolves the correct venv automatically.
- **API**: register routers in `backend/config/api.py`; URL prefix `/api/`. Schemas live next to apps (e.g. `apps/core/schemas.py`).
- **Frontend pages**: each page lives in `src/pages/<name>/<Name>Page.tsx`; add routes in `src/app/browser-router.tsx` wrapped by `AppLayout`; unknown paths throw a 404 `Response`.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge`.
- **Lint/format before committing**: `npm run lint` and `npm run format` must pass.
- **Env vars**: backend reads from `backend/.env` (python-decouple). Never commit `.env`.
- **Static files**: backend `collectstatic` output goes to the shared `django_static` Docker volume; Nginx serves it — don't change the volume wiring without updating both `docker-compose.yml` and `frontend/nginx.conf`.
- Don't edit `backend/staticfiles/` (generated artifacts).

## Common Gotchas & Fixes

### Production / CI/CD

- **`docker-compose up -d` fails with `CNI network "evp-website_default" not found`**
  - Cause: Podman on Tardis uses CNI with `cniVersion: 1.0.0` in the conflist, but `docker-compose` v1 expects `0.4.0`.
  - Fix: Edit `~/.config/cni/net.d/<compose-project-name>.conflist` and change `"cniVersion": "1.0.0"` → `"0.4.0"`, then re-run `docker-compose up -d`.
  - The compose project name is typically the directory name — e.g. `evp-website_default.conflist`.

- **SSH deploy works but `docker-compose` fails with `PermissionError(13, 'Permission denied')`**
  - The server uses Podman rootless (no `/var/run/docker.sock`). The deploy script must set `DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock` and `DOCKER_CONFIG=$XDG_RUNTIME_DIR/containers`.
