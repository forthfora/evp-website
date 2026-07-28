# Product Requirements Document — Edinburgh VenturePoint Website

|                  |                                           |
| ---------------- | ----------------------------------------- |
| **Product**      | Edinburgh VenturePoint (EVP) Website      |
| **Status**       | Live — https://edinburghventurepoint.com  |
| **Hosting**      | Tardis servers (https://tardisproject.uk) |
| **Last updated** | 2026-07-28                                |

## 1. Overview

The official website for **Edinburgh VenturePoint**, an entrepreneurship society at the
University of Edinburgh. The site presents the society to students, founders, sponsors,
and partners; showcases events and startups; and provides contact pathways.

## 2. Goals & Objectives

- Present a professional public face for the society to prospective members, sponsors, and partners.
- Promote upcoming and past **events** (talks, hackathons, networking, competitions).
- Showcase member/alumni **startups**.
- Provide clear **contact** channels for enquiries and sponsorship.
- Communicate the society's mission, team, and history (**About**).
- Allow committee members to manage content via an admin panel.

## 3. Target Audience

- University of Edinburgh students interested in entrepreneurship (primary).
- Startup founders and alumni affiliated with the society.
- Sponsors, investors, and partner organisations.
- Guest speakers and event collaborators.

## 4. Scope

### 4.1 In Scope (current pages)

| Page     | Route       | Purpose                                                           |
| -------- | ----------- | ----------------------------------------------------------------- |
| Home     | `/`         | Landing page, hero, highlights, calls to action                   |
| About    | `/about`    | Mission, history, committee/team                                  |
| Startups | `/startups` | Showcase of society-affiliated startups and partner organisations |
| Events   | `/events`   | Upcoming and past events                                          |
| Contact  | `/contact`  | Contact form / enquiry details                                    |
| Error    | `*` (404)   | Friendly not-found / error page                                   |

### 4.2 Backend Capabilities

- **Accounts**: custom email-based user model, JWT authentication, admin management.
- **Admin panel** (`/admin/`, Jazzmin-themed) for committee content management.
- **REST API** (`/api/`, Django Ninja) with auto-generated docs at `/api/docs`.

### 4.3 Out of Scope (for now)

- Public user registration / member accounts on the frontend.
- Payments, ticketing, or e-commerce.
- Blog/CMS beyond what the admin panel manages.

## 5. Functional Requirements

1. The site shall render all public pages as a client-side React SPA with a shared layout.
2. Unknown routes shall display a styled 404 error page.
3. The backend shall expose a versioned REST API under `/api/` with OpenAPI docs.
4. Authentication shall use email + password issuing JWT tokens.
5. Administrators shall manage users and content through the Django admin panel.
6. The frontend shall fetch dynamic data via the API (TanStack React Query) with runtime validation (zod).

## 6. Non-Functional Requirements

- **Performance**: static assets served via Nginx; frontend built and minified by Vite.
- **SEO**: `robots.txt` and `sitemap.xml` served from `frontend/public/`.
- **Reliability**: fully containerized (Docker Compose); production deploys automated via GitHub Actions (CI test job → matrix build → GHCR → SSH rolling update); images tagged with both `latest` and commit SHA for rollback capability.
- **Security**: environment-based secrets (`backend/.env`), CORS restricted, JWT auth, no committed credentials.
- **Maintainability**: TypeScript + ESLint/Prettier on the frontend; type-hinted Python + Pydantic schemas on the backend.

## 7. Technical Architecture

- **Frontend**: React 19 + Vite 8 + TypeScript 6, React Router 7, Tailwind CSS 4, three.js, framer-motion. Path aliases `@/`, `@assets/`, `@common`. Served by Nginx on port 16017.
- **Backend**: Django 6 + Django Ninja, Gunicorn (port 17017), MySQL in production.
- **Infra**: Docker Compose orchestration; images in GHCR at `ghcr.io/forthfora/evp-website/<service>`; CI/CD on push to `main` (test → build-and-push → deploy) and on PRs (test + build only). GHA layer caching (type=gha) used for faster builds.
- See `AGENTS.md` at the repo root for detailed developer/agent guidance.

## 8. Success Metrics

- Uptime on Tardis hosting.
- Event page engagement (visits around announced events).
- Contact/enquiry conversion through the Contact page.
- Successful automated deployments with zero-downtime restarts.

## 9. Future Considerations

- Member sign-up / login on the frontend using the existing JWT backend.
- Event RSVP/ticketing integration.
- Startup directory with submissions via the API.
- Newsletter signup and sponsor logo management via the admin panel.
