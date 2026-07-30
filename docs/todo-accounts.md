# TODO — PLAN: Frontend Integration — Auth, Startup Database & Admin Tools

**Status:** 📋 In progress — backend built (not extensively reviewed), frontend integration remaining
**Supersedes:** the previous todo-accounts.md (Phases 0–6 backend work — ✅ done, with changes: newsletter dropped, directory → startup database, 4th Admin role added)
**Authoritative architecture reference:** `docs/adr/0002-roles-startupdb-and-admin-comms.md`

## Overview

The backend now provides:

- **Passwordless accounts** — OTP email flow (`/api/auth/request-code`,
  `/api/auth/verify-code`), JWT access token in body + refresh token in
  HttpOnly cookie, `/api/accounts/me` profile endpoint.
- **4 roles** — `member` (default), `scout`, `committee`, `admin`, elevated
  manually in the Django admin.
- **Startup database** — `StartupEntry` CRUD at `/api/startupdb`, gated by
  `require_role("scout", "committee", "admin")`; ownership rule: scouts and
  committee manage only their own entries, admin manages all.
- **Email plumbing** — Resend-backed `send_email`/`send_otp_email` in
  `apps/core/email.py`; `User.receives_update_emails` opt-out flag.

What remains:

1. **Backend gap-closure** — Founder schema + StartupEntry restructure
   (T1), members-list endpoint, admin update-email endpoint,
   permission/schema fixes (see ADR 0002 Known Issues).
2. **Frontend integration** — auth flow, route guards, member area with the
   startup database UI, members list, and admin email composer.

**Role/capability contract (mirror this exactly in the frontend):**

| Capability                        | Member | Scout | Committee | Admin |
| --------------------------------- | ------ | ----- | --------- | ----- |
| View startup database             | ❌     | ✅    | ✅        | ✅    |
| Add startups/founders             | ❌     | ✅    | ✅        | ✅    |
| Edit/delete own startups/founders | ❌     | ✅    | ✅        | ✅    |
| Edit/delete any startup/founder   | ❌     | ❌    | ❌        | ✅    |
| View all members                  | ❌     | ❌    | ✅        | ✅    |
| Send update emails to all members | ❌     | ❌    | ❌        | ✅    |
| Django admin panel                | ❌     | ❌    | ❌        | ✅    |

**Testing policy:** backend gap-closure tasks write tests first
(`hypothesis` for rule/permission matrices). Frontend tasks write
component/behavior tests (Vitest + React Testing Library) before building UI
where practical.

## Legend

- Task IDs are `T#`; subtasks `T#.#`. **Depends on:** lists prerequisite task
  IDs. Backend-complete items are summarized at the bottom, not re-planned.

---

## Phase 0 — Backend Verification & Gap Closure

### T1 — `Founder` model + `StartupEntry` schema restructure

**Depends on:** none

New requirement: founders become first-class records in `apps/startupdb`,
and startups link to one or more founders. Both schemas below are the
target state (see ADR 0002 for the design notes).

**`Founder` (new model):**

| Field        | Type / notes                                                        |
| ------------ | ------------------------------------------------------------------- |
| `first_name` | CharField — composite natural key with `last_name`                  |
| `last_name`  | CharField — composite natural key with `first_name`                 |
| `location`   | CharField, blank                                                    |
| `occupation` | CharField choices: `bachelors`, `masters`, `phd`, `graduated`       |
| `linkedin`   | URLField, blank                                                     |
| `email`      | EmailField, blank                                                   |
| `notes`      | TextField, blank                                                    |
| `created_by` | FK → `User` (CASCADE) — same ownership rules as startups            |
| `created_at` / `updated_at` | auto timestamps                                          |

**`StartupEntry` (restructured):**

| Field           | Type / notes                                                       |
| --------------- | ------------------------------------------------------------------ |
| `name`          | CharField, **unique** (natural key)                                |
| `founders`      | **ManyToManyField → `Founder`** (one or more per startup)          |
| `founding_date` | DateField, null/blank                                              |
| `description`   | TextField, blank                                                   |
| `website`       | URLField, blank                                                    |
| `linkedin`      | URLField, blank                                                    |
| `email`         | EmailField, blank                                                  |
| `location`      | CharField, blank                                                   |
| `notes`         | TextField, blank                                                   |
| `created_by`    | FK → `User` (CASCADE) — unchanged                                  |
| `created_at` / `updated_at` | auto timestamps — unchanged                             |

⚠️ This replaces the current `founders` CharField and adds `founding_date`,
`linkedin`, `location`, `notes`. Existing dev data will need to be migrated
or discarded — SQLite dev DB can simply be rebuilt.

- [x] T1.1 — Write tests first in `apps/startupdb/tests/test_models.py`: `Founder` field defaults and `occupation` choices; composite name uniqueness (duplicate `(first_name, last_name)` rejected); `StartupEntry.name` uniqueness; a startup can link multiple founders and a founder can link to multiple startups; `created_by` required on both models
- [x] T1.2 — Implement the `Founder` model with a `unique_together` (or `UniqueConstraint`) on `(first_name, last_name)` and an `Occupation` `TextChoices` enum (`BACHELORS`, `MASTERS`, `PHD`, `GRADUATED`)
- [x] T1.3 — Restructure `StartupEntry`: make `name` unique, replace the `founders` CharField with `founders = ManyToManyField(Founder, related_name="startups")`, add `founding_date`, `linkedin`, `location`, `notes`; drop the now-redundant old fields per the target schema
- [x] T1.4 — Generate and run migrations (dev DB rebuild is acceptable); confirm T1.1 tests pass
- [x] T1.5 — Update `apps/startupdb/api.py` schemas and endpoints: `FounderIn`/`FounderOut`/`FounderPatchIn`; founder CRUD endpoints (`GET/POST /api/startupdb/founders`, `PATCH/DELETE /api/startupdb/founders/{id}`) behind the same `require_role("scout", "committee", "admin")` + `can_manage_entry` ownership rules as startups; update `EntryIn`/`EntryOut`/`EntryPatchIn` to the new shape (founder IDs in, nested or expanded founder objects out)
- [x] T1.6 — Write API tests first (before T1.5 implementation per testing policy), including a hypothesis property test over `(role, is_owner)` for founder edit/delete mirroring the startup matrix; update existing startup API tests to the new schema
- [x] T1.7 — Register `Founder` in `apps/startupdb/admin.py` (`list_display` on name, occupation, created_by); add founders inline or a filter widget on the `StartupEntry` admin
- [x] T1.8 — Seed/update dummy data: 3–5 founders and 3–5 startups with founder links for local dev/demo

### T2 — Verify the refactored backend

**Depends on:** T1

The refactor has not been extensively tested or reviewed. Do this before
building on top of it.

- [x] T2.1 — Run the full suite: `uv run pytest`, `uv run ruff check`, `uv run python manage.py check`; fix any failures before proceeding
- [x] T2.2 — Fix `can_send_notifications` in `apps/core/permissions.py` to check `user.is_admin` (per the role contract — only Admin sends update emails); update/add a hypothesis property test covering the full role matrix for this helper
- [x] T2.3 — Fix the docstring drift in `permissions.py` (`can_manage_startup` comments claim committee can manage any entry — code and requirements say own entries only) and the `TYPE_CHECKING` import path (`backend.apps.*` → `apps.*`)
- [x] T2.4 — Replace the `FROM_EMAIL = "[EMAIL]"` placeholder in `config/settings.py` with an env-driven value (`python-decouple`); document it in `backend/.env.example`

### T3 — Members-list endpoint

**Depends on:** T2

- [x] T3.1 — Write tests first in `apps/accounts/tests/` (new `test_members_api.py`): `GET /api/accounts/members` returns 401 unauthenticated, 403 for member/scout, 200 with the full member list for committee and admin; include a hypothesis property test over the role matrix
- [x] T3.2 — Implement `GET /api/accounts/members` with `auth=require_role("committee", "admin")`, returning a list schema (`id`, `email`, `role`, `image`, `date_joined`, `receives_update_emails`)

### T4 — Admin update-email endpoint

**Depends on:** T2, T3

- [x] T4.1 — Write tests first: `POST /api/updates/send` returns 401 unauthenticated, 403 for member/scout/committee, 200 for admin; assert `send_email` is called exactly once per user with `receives_update_emails=True` and never for opted-out users (mock the email layer); hypothesis property test over the role matrix
- [x] T4.2 — Implement `POST /api/updates/send` (subject + body in, per-member send via `apps/core/email.py::send_email`, summary counts out: `{sent, skipped, failed}`). Synchronous fan-out is accepted for now — see ADR 0002 Known Issue #9
- [x] T4.3 — Register the router in `config/api.py`; confirm it appears in `/api/docs`

---

## Phase 1 — Frontend: Auth Infrastructure

### T5 — Auth API client + zod schemas

**Depends on:** T2

- [x] T5.1 — Add zod schemas for the auth payloads (`RequestCodeInput`, `VerifyCodeInput`, `AuthResponse` (`{access}`), `MeResponse` (`{email, role, date_joined}`), plus a `Role` enum mirroring the backend) in `frontend/src/shared/lib/`
- [x] T5.2 — Add typed fetch functions (`requestCode(email)`, `verifyCode(email, code)`, `fetchMe()`) wired through TanStack React Query, matching the API's structured error shape (`{"errors": {field: [msgs]}}`)

### T6 — `AuthContext` & token storage

**Depends on:** T5

Per ADR 0001: access token in React state only (never localStorage); refresh
via the HttpOnly cookie set by `verify-code` (and jwtninja's refresh
endpoint under `/api/auth/`).

- [x] T6.1 — Write tests first (Vitest + React Testing Library): `AuthContext` starts unauthenticated, becomes authenticated after a successful `verifyCode`, clears on logout/401
- [x] T6.2 — Implement `AuthProvider` in `frontend/src/shared/lib/auth/` holding `{accessToken, user: {email, role}}` in state; on mount, attempt silent refresh via the cookie, then call `GET /api/accounts/me` to hydrate
- [x] T6.3 — Add an `apiFetch` wrapper that attaches the access token, retries once on 401 via the refresh cookie, and surfaces a clean logged-out state on repeated failure

### T7 — Register/Login page

**Depends on:** T6

- [x] T7.1 — Write tests first: email step → code step → success redirects to the member area; invalid code shows an inline error; cooldown (429) shows a "wait before resending" message
- [x] T7.2 — Build `frontend/src/pages/auth/AuthPage.tsx` as a two-step flow (email → 6-digit code) using existing shared UI primitives and Tailwind conventions; add the route (e.g. `/join`) in `browser-router.tsx`

### T8 — Route guards

**Depends on:** T6

- [x] T8.1 — Write tests first: unauthenticated visit to a protected route redirects to `/join`; a `member` visiting a scout+/committee+/admin-only route gets a 403-style page; matching roles pass through
- [x] T8.2 — Implement `ProtectedRoute` (any authenticated user) and `RoleRoute(roles: Role[])` wrappers; wire into `browser-router.tsx` around the member-area routes in Phase 2

### T9 — Navbar / `AppLayout` auth state

**Depends on:** T6

- [x] T9.1 — Update the shared navbar: "Join / Log in" when signed out; account menu (email, role badge, log out) when signed in, following existing header styling in `app/app-layout`

---

## Phase 2 — Frontend: Member Area

### T10 — Member dashboard shell with role-based widget registry

**Depends on:** T7, T8, T9

Layout per role isn't fixed yet — build a registry, not hard-coded pages, so
future widgets are a one-line registration.

- [x] T10.1 — Write tests first: mocked `AuthContext` with role `member` renders only member-eligible widgets; `scout`/`committee`/`admin` render their additional widgets
- [x] T10.2 — Build `frontend/src/pages/member/MemberDashboardPage.tsx` reading `user.role` from `AuthContext`, rendering widgets filtered by a `visibleTo: Role[]` field declared alongside each widget
- [x] T10.3 — Register the dashboard route (e.g. `/member`) behind `ProtectedRoute` from T8

### T11 — Startup database UI

**Depends on:** T1, T5, T10

The startup schema will grow — keep the table/form driven by the zod schema
so adding a field later touches one file.

- [ ] T11.1 — Write tests first: a `scout` sees edit/delete controls only on entries where `created_by_id` matches their own; `committee` likewise (own entries only); `admin` sees edit/delete on all entries; a `member` never sees this widget
- [ ] T11.2 — Build the startup database widget/page with a list/table of entries (name, founders, founding date, website, linkedin, email, location, notes, description), a create/edit form with a **founder multi-select** (pick existing founders and/or create new ones inline via the founder endpoints from T1.5), and inline edit/delete gated per T11.1 — calling `/api/startupdb` endpoints; register in the widget registry with `visibleTo: [scout, committee, admin]`
- [ ] T11.3 — Build the founders section (list + create/edit/delete form) within the same widget or as a sibling widget with the same `visibleTo` and ownership rules
- [ ] T11.4 — Confirm the UI handles the backend's 403 on ownership violations gracefully (the backend is authoritative; client-side gating is a convenience only)

### T12 — Members list UI (Committee + Admin)

**Depends on:** T3, T10

- [ ] T12.1 — Write tests first: `committee`/`admin` see the members table; `scout`/`member` do not
- [ ] T12.2 — Build a members widget fetching `GET /api/accounts/members` — table of email, role badge, join date, update-email opt-in status; register with `visibleTo: [committee, admin]`

### T13 — Admin update-email composer

**Depends on:** T4, T10

- [ ] T13.1 — Write tests first: only `admin` sees the composer; submit shows a confirmation, then success/failure counts from the API response
- [ ] T13.2 — Build an email composer widget (subject + body, plain text with a preview) posting to `POST /api/updates/send`; register with `visibleTo: [admin]`

---

## Phase 3 — Docs & Rollout

### T14 — Update project docs

**Depends on:** T13

- [ ] T14.1 — Update `AGENTS.md` repository layout with `frontend/src/pages/auth/`, `frontend/src/pages/member/`, and the new updates endpoint location from T4; note the 4-role system and `apps/startupdb` conventions (already documents the Founder/StartupEntry schema)
- [ ] T14.2 — Update `specs.md` §4 (Scope) and §9 (Future Considerations) — member accounts, startup database, and admin update emails are now in scope
- [ ] T14.3 — Update `backend/.env.example` with any settings added in Phase 0 (e.g. `FROM_EMAIL`)

### T15 — Manual QA pass across all four roles

**Depends on:** T14

- [ ] T15.1 — Create one test account per role (`member`, `scout`, `committee`, `admin`) via the real email flow, elevating roles in the Django admin
- [ ] T15.2 — Walk through: registration email delivery, code expiry/lockout/cooldown, startup database visibility and ownership rules (scout editing another scout's entry/founder fails; admin succeeds), founder linking (multi-founder startups, shared founders), members list visibility (committee/admin only), admin email composer delivery and opt-out respect, logout and silent session refresh
- [ ] T15.3 — Confirm `npm run lint`, `npm run build`, `uv run pytest`, `uv run ruff check` all pass before merging to `main`

---

## Backend status reference (already implemented — do not rebuild)

| Feature                                                   | Location                                  |
| --------------------------------------------------------- | ----------------------------------------- |
| OTP request/verify, cooldown, lockout                     | `apps/accounts/api.py`, `models.EmailOTP` |
| JWT issue + HttpOnly refresh cookie                       | `apps/accounts/api.py::_issue_tokens`     |
| `/api/accounts/me`                                        | `apps/accounts/api.py`                    |
| Role field (4 roles) + `is_scout/is_committee/is_admin`   | `apps/accounts/models.py`                 |
| `require_role`, `can_manage_entry`, `can_view_startups` | `apps/core/permissions.py`                |
| Startup CRUD `/api/startupdb` with ownership rules        | `apps/startupdb/api.py` (schema update in T1) |
| Resend email wrapper (`send_email`, `send_otp_email`)     | `apps/core/email.py`                      |
| `receives_update_emails` opt-out flag                     | `apps/accounts/models.py`                 |
| Role management via Django admin                          | `apps/accounts/admin.py`                  |

## Notes / explicitly deferred (not part of this plan)

- Password-based login is _not_ implemented — only the extension point from
  ADR 0001 (unusable-password schema) is in place.
- Async/queued email fan-out (e.g. Celery) is deferred — synchronous sending
  is accepted at current membership scale (ADR 0002 Known Issue #9).
- Committee startup permissions currently equal Scout's; any future elevation
  is a one-function change in `can_manage_entry` (ADR 0002 Decision 2).
- No persistent newsletter/issue archive — admin emails are ad-hoc sends.
- Public `/startups` showcase page remains static; surfacing `StartupEntry`
  data publicly is a separate future decision.
- Founder deduplication/merge tooling — composite-name uniqueness catches
  exact duplicates only; fuzzy matching is a future concern if the data grows.
