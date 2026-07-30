# Product Requirements Document — Edinburgh VenturePoint Website

|                  |                                           |
| ---------------- | ----------------------------------------- |
| **Product**      | Edinburgh VenturePoint (EVP) Website      |
| **Status**       | Live — https://edinburghventurepoint.com  |
| **Hosting**      | Tardis servers (https://tardisproject.uk) |
| **Last updated** | 2026-07-30                                |

## 1. Overview

The official website for **Edinburgh VenturePoint**, an entrepreneurship society at the
University of Edinburgh. The site presents the society to students, founders, sponsors,
and partners; showcases events and startups; provides contact pathways; and gives
members accounts with role-based access to an internal startup database and
society communications.

## 2. Goals & Objectives

- Present a professional public face for the society to prospective members, sponsors, and partners.
- Promote upcoming and past **events** (talks, hackathons, networking, competitions).
- Showcase member/alumni **startups**.
- Provide clear **contact** channels for enquiries and sponsorship.
- Communicate the society's mission, team, and history (**About**).
- Allow **members** to create passwordless accounts (email one-time code).
- Maintain an internal **startup database** contributed to by Scouts and managed by Admins.
- Let **Admins** send update emails to all members.
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

- **Accounts**: custom email-based user model, **passwordless authentication**
  (one-time email code → JWT; see `docs/adr/0001-passwordless-auth.md`),
  admin management.
- **Roles**: every account has one of four roles — `member` (default),
  `scout`, `committee`, `admin` — elevated manually via the Django admin.
  See §4.3 for the capability matrix and `docs/adr/0002-roles-startupdb-and-admin-comms.md`
  for the full architecture.
- **Startup database**: `StartupEntry` records (unique name, founders,
  founding date, description, website, linkedin, email, location, notes)
  linked many-to-many to `Founder` records (first & last name as the
  composite natural key, occupation, location, linkedin, email, notes), with
  an ownership-based permission model, exposed at `/api/startupdb`. The
  schema is expected to evolve.
- **Admin communications**: Admins can send update emails to all members
  (opt-out via `receives_update_emails`).
- **Admin panel** (`/admin/`, Jazzmin-themed) for committee/admin content and
  role management.
- **REST API** (`/api/`, Django Ninja) with auto-generated docs at `/api/docs`
  (DEBUG only).

### 4.3 Roles & Permissions

| Capability                        | Member | Scout | Committee | Admin |
| --------------------------------- | ------ | ----- | --------- | ----- |
| View startup database             | ❌     | ✅    | ✅        | ✅    |
| Add startups/founders             | ❌     | ✅    | ✅        | ✅    |
| Edit/delete **own** startups/founders | ❌  | ✅    | ✅        | ✅    |
| Edit/delete **any** startup/founder   | ❌  | ❌    | ❌        | ✅    |
| View all members                  | ❌     | ❌    | ✅        | ✅    |
| Send update emails to all members | ❌     | ❌    | ❌        | ✅    |
| Django admin panel                | ❌     | ❌    | ❌        | ✅    |

Committee startup permissions currently equal Scout's and are subject to
change; the rule lives in a single backend permission function.

### 4.4 Out of Scope (for now)

- Password-based login (the schema keeps the extension point open — see ADR 0001).
- Payments, ticketing, or e-commerce.
- Blog/CMS beyond what the admin panel manages.
- A persistent newsletter/issue archive — admin emails are ad-hoc sends.
- Public display of the internal startup database (the `/startups` page remains
  a curated showcase).

## 5. Functional Requirements

1. The site shall render all public pages as a client-side React SPA with a shared layout.
2. Unknown routes shall display a styled 404 error page.
3. The backend shall expose a REST API under `/api/` with OpenAPI docs (DEBUG only).
4. Authentication shall be passwordless: users request a one-time code by email and
   verify it to receive JWT tokens (access token in the response body, refresh token
   in an HttpOnly cookie).
5. Every account shall have a role (`member`, `scout`, `committee`, `admin`),
   changeable only by staff through the Django admin.
6. The startup database shall store startups and founders as separate record
   types, linked many-to-many (a startup has one or more founders; a founder
   may appear on multiple startups). Both shall be readable and writable per
   the role matrix in §4.3, with `created_by` always set server-side from the
   authenticated user.
7. Administrators shall manage users, roles, and content through the Django admin panel.
8. Admins shall be able to send update emails to all members who have not opted out.
9. The frontend shall fetch dynamic data via the API (TanStack React Query) with runtime validation (zod).

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

- Password-based login as an additional auth mechanism (extension point documented in ADR 0001).
- Elevated Committee permissions on the startup database (single-function change in `can_manage_entry`).
- Async/queued delivery for admin update emails if membership grows.
- Event RSVP/ticketing integration.
- Public startup directory surfacing `StartupEntry` data, with submissions via the API.
- Member profile pages (avatars, bios) building on the existing `User.image` field.
- Unsubscribe/self-service email preference management on the frontend.
