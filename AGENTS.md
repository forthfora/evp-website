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
│   │   ├── accounts/         # Custom User model, auth API
│   │   └── core/             # Shared API/schemas
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
├── backend.code-workspace / frontend.code-workspace / fullstack.code-workspace
└── README.md
```

## Tech Stack

### Backend

- **Python ≥ 3.13**, **Django 6**, **Django Ninja 1.6** (REST API, Pydantic validation)
- **jwtninja** for JWT auth, **django-cors-headers**, **django-jazzmin** (admin theme)
- **Gunicorn** (WSGI server in prod), **uv** for dependency management
- DB: MySQL/PyMySQL in prod (psycopg also available); SQLite (`db.sqlite3`) locally
- Custom `User` model in `apps/accounts/models.py` — email is `USERNAME_FIELD`; no first/last name

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

- **Backend code style**: modern typing (`from __future__ import annotations`, PEP 695 generics e.g. `class UserManager[T]`), type hints everywhere.
- **API**: register routers in `backend/config/api.py`; URL prefix `/api/`. Schemas live next to apps (e.g. `apps/core/schemas.py`).
- **Auth**: JWT via `jwtninja`; email+password login (no username login).
- **Frontend pages**: each page lives in `src/pages/<name>/<Name>Page.tsx`; add routes in `src/app/browser-router.tsx` wrapped by `AppLayout`; unknown paths throw a 404 `Response`.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge`.
- **Lint/format before committing**: `npm run lint` and `npm run format` must pass.
- **Env vars**: backend reads from `backend/.env` (python-decouple). Never commit `.env`.
- **Static files**: backend `collectstatic` output goes to the shared `django_static` Docker volume; Nginx serves it — don't change the volume wiring without updating both `docker-compose.yml` and `frontend/nginx.conf`.
- Don't edit `backend/staticfiles/` (generated artifacts).
