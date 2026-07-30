# TODO — PLAN: Passwordless Accounts, Roles, Newsletter & Member Database

**Status:** 📋 Planned — supersedes the previous todo.md (Partners section + CI/CD fixes, both ✅ done)
**Depends on repo state described in:** `AGENTS.md`, `specs.md` §9 (Future Considerations)

## Overview

This plan implements four connected features:

1. **Passwordless accounts** — register/login with only an email address; a one-time
   code is emailed to confirm identity and issue JWTs (via the existing `jwtninja`
   setup). No password required now, but the design must not preclude adding
   password auth later.
2. **Roles** — every `User` gets a `role`: `member` (default), `scout`, or
   `committee`. Roles are elevated manually by staff in the Django admin
   (Jazzmin) — no self-service role changes.
3. **Newsletter** — logged-in members see newsletter content; committee
   publishes issues; publishing triggers an email notification (via Resend,
   `RESEND_API_KEY` already present in `.env.example`).
4. **Central database** — a flexible, admin-defined dataset ("directory
   entries") that Scouts and Committee can read/create; Scouts may only
   edit/delete their own entries; Committee can manage everything.

**Testing policy for this plan:** every backend task writes tests _before_
implementation, using `hypothesis` for property-based tests wherever a task
involves a rule, matrix, or invariant (permission checks, code expiry, role
combinations). Frontend tasks likewise write component/behavior tests before
building the UI where practical.

## Legend

- Task IDs are `T#`; subtasks are `T#.#`.
- **Depends on:** lists task IDs that must be complete first. No task is an
  orphan — everything is either a foundation (no deps) or wired to earlier work.
- File paths follow the conventions in `AGENTS.md` (backend apps under
  `backend/apps/`, frontend pages under `frontend/src/pages/<name>/`).

---

## Phase 0 — Foundations

### T1 — Architecture decision record: passwordless auth design

**Depends on:** none

Write a short ADR (e.g. `docs/adr/0001-passwordless-auth.md`) documenting the
approach so future-you (or another agent) doesn't have to reverse-engineer it:

- `User.password` stays a normal Django field, always set unusable via
  `set_unusable_password()` at creation — this keeps the door open for a
  future password-based login endpoint without a schema change.
- A single unified flow: `POST /api/auth/request-code` (creates the user
  lazily if they don't exist) → `POST /api/auth/verify-code` (confirms code,
  returns JWT access + refresh via `jwtninja`). No separate "register" vs
  "login" endpoint — the email is the only identity.
- Token storage strategy for the frontend: access token kept in memory
  (React state, not localStorage), refresh token in an `HttpOnly`, `Secure`,
  `SameSite=Lax` cookie set by the backend response. This avoids XSS token
  theft and matches the fact that frontend and API share an origin via Nginx.

- [x] T1.1 — Draft the ADR covering the three decisions above and get sign-off (even if that's just you re-reading it) before writing code
- [x] T1.2 — Note in the ADR the extension point for future password auth (e.g. `POST /api/auth/login-password`, disabled until a password is set)

### T2 — Backend dev dependencies for the new features

**Depends on:** T1

- [x] T2.1 — Add `hypothesis`, `pytest`, `pytest-django` to `backend/pyproject.toml` dev dependencies; run `uv sync`
- [x] T2.2 — Add a Resend Python SDK (or minimal `httpx`-based client if you'd rather avoid the dependency) to `backend/pyproject.toml`
- [x] T2.3 — Confirm `djangorestframework` is genuinely unused (API is Django Ninja only) and remove it from `pyproject.toml` if so — small cleanup, low risk, do it now while touching deps anyway
- [x] T2.4 — Add a `pytest.ini` / `[tool.pytest.ini_options]` block pointing at `DJANGO_SETTINGS_MODULE` so `uv run pytest` works alongside the existing `manage.py test`

---

## Phase 1 — Backend: Accounts & Roles

### T3 — Extend `User` model with a `role` field

**Depends on:** T2

`apps/accounts/models.py` currently has a custom email-based `User` with no
first/last name. Add role support without disturbing existing auth wiring.

- [x] T3.1 — Write tests first in `apps/accounts/tests/test_models.py`: a `hypothesis` property test asserting every newly created `User` defaults to `role="member"` and `has_usable_password() is False` regardless of the email used (use `hypothesis.strategies.emails()` or a constrained email strategy)
- [x] T3.2 — Add `role = models.CharField(choices=Role.choices, default=Role.MEMBER)` with a `Role` `TextChoices` enum (`MEMBER`, `SCOUT`, `COMMITTEE`) on `User`
- [x] T3.3 — Generate and run the migration; confirm tests from T3.1 pass
- [x] T3.4 — Add convenience properties `is_scout` / `is_committee` / `is_privileged` (scout or committee) on `User` for reuse across permission checks later

### T4 — Django admin: role management

**Depends on:** T3

- [x] T4.1 — Update `apps/accounts/admin.py`: add `role` to `list_display`, `list_filter`, and the edit form fieldsets
- [x] T4.2 — Confirm (via a quick admin smoke test or manual check) that only staff/superuser accounts can reach the admin and change `role` — this is the entire "elevation" mechanism for now, no extra permission class needed since Django admin access is already staff-gated

---

## Phase 2 — Backend: Passwordless OTP Auth

### T5 — `EmailOTP` model

**Depends on:** T3

A short-lived code tied to an email address, not a `User` FK, since the user
may not exist yet at request time.

- [x] T5.1 — Write tests first: hypothesis property tests in `apps/accounts/tests/test_otp.py` asserting — for any 4–8 character alphanumeric code and any `expires_at` — that `is_valid()` is `True` only when unconsumed and before expiry, and `False` after `consume()` is called or after expiry (freeze time with `freezegun` or Django's `override_settings`/`time.sleep`-free approach)
- [x] T5.2 — Implement `EmailOTP` model: `email`, `code_hash` (store a hash, never the raw code), `created_at`, `expires_at`, `consumed_at` (nullable), `attempts` (int, default 0)
- [x] T5.3 — Implement `generate_code()` classmethod (6-digit numeric, hashed with Django's `make_password`/`check_password` helpers) and `consume(code)` instance method that increments `attempts`, checks the hash, and marks `consumed_at`
- [x] T5.4 — Add a max-attempts property (e.g. locked after 5 wrong attempts) and cover it with a hypothesis test: for any number of prior attempts ≥ the max, `consume()` always returns invalid even with the correct code

### T6 — Resend email service wrapper

**Depends on:** T2

- [x] T6.1 — Write tests first: unit tests in `apps/core/tests/test_email.py` that mock the Resend client and assert `send_otp_email(email, code)` calls it with the right recipient and that the code appears in the rendered body
- [x] T6.2 — Implement `apps/core/email.py` with `send_otp_email(email, code)` and a generic `send_email(to, subject, body)` used later by the newsletter feature; read `RESEND_API_KEY` from settings via `python-decouple`
- [x] T6.3 — Add a `DEBUG`-mode fallback that logs the email to the console instead of calling Resend, so local dev doesn't need a real API key

### T7 — Auth API: `request-code` & `verify-code` endpoints

**Depends on:** T5, T6

- [x] T7.1 — Write tests first: integration tests in `apps/accounts/tests/test_auth_api.py` covering — request-code always returns 202 whether or not the user exists (no user enumeration); verify-code with a correct unexpired code creates the user if new and returns JWT tokens; verify-code with a wrong/expired/consumed code returns 400/401 and does not issue tokens
- [x] T7.2 — Add a hypothesis property test: for any valid email and any 6-digit code that does _not_ match the stored one, verify-code never succeeds
- [x] T7.3 — Implement `POST /api/auth/request-code` in `apps/accounts/api.py`: creates an `EmailOTP`, calls `send_otp_email`
- [x] T7.4 — Implement `POST /api/auth/verify-code`: validates via `EmailOTP.consume`, gets-or-creates the `User` (unusable password, `role=member`), issues tokens through the existing `jwtninja` integration
- [x] T7.5 — Wire the refresh token into an `HttpOnly` cookie on the response per the ADR (T1), keep the access token in the JSON body for the frontend to hold in memory

### T8 — Rate limiting for OTP requests

**Depends on:** T7

Prevents spamming an inbox with codes or brute-forcing a 6-digit code.

- [x] T8.1 — Write tests first: assert that repeated `request-code` calls for the same email within a cooldown window (e.g. 60s) are rejected or throttled, and that verify-code respects `EmailOTP`'s max-attempts lockout from T5.4
- [x] T8.2 — Implement a simple cooldown check (DB-timestamp based is fine at this scale — no need for Redis yet) in the `request-code` view

### T9 — `/api/accounts/me` profile endpoint

**Depends on:** T7

- [x] T9.1 — Write tests first: authenticated request returns the current user's `email` and `role`; unauthenticated request returns 401
- [x] T9.2 — Implement `GET /api/accounts/me` returning a small Pydantic schema (`email`, `role`, `date_joined`) — this is what the frontend `AuthContext` will call on load to hydrate session state

---

## Phase 3 — Backend: Role Permission Framework

### T10 — `require_role(*roles)` permission dependency

**Depends on:** T3

A single reusable authorization helper so newsletter and directory endpoints
don't each reinvent role checks.

- [x] T10.1 — Write tests first: a hypothesis property test over the full matrix of `(user_role, required_roles)` combinations asserting `require_role` allows access iff `user_role in required_roles`, plus an explicit case that unauthenticated requests are always denied
- [x] T10.2 — Implement `apps/core/permissions.py::require_role` as a Django Ninja auth/dependency helper usable as `@router.get(..., auth=require_role("scout", "committee"))` or as an in-view guard, whichever fits the existing `jwtninja` auth pattern already used in the codebase
- [x] T10.3 — Add an `is_owner_or_committee(user, obj)` helper (checks `obj.created_by == user` or `user.is_committee`) for the ownership rule needed by the directory feature in Phase 5

---

## Phase 4 — Backend: Newsletter

### T11 — `NewsletterIssue` model + admin

**Depends on:** T3

- [x] T11.1 — Write tests first: model tests asserting a draft (`published_at=None`) is excluded from a `published()` queryset manager, and a published issue is included
- [x] T11.2 — Implement `NewsletterIssue` in a new `apps/newsletter/` app: `title`, `body` (TextField, markdown-as-plain-text is fine for now), `published_at` (nullable), `created_by` FK to `User`, `created_at`, `updated_at`; add the `published()` manager method
- [x] T11.3 — Register in Django admin with `list_display`/`list_filter` on `published_at`, and restrict add/change to staff (default admin behavior already covers this)

### T12 — Newsletter API endpoints

**Depends on:** T10, T11

- [x] T12.1 — Write tests first: `GET /api/newsletter/issues` returns only published issues to any authenticated member; `POST/PATCH/DELETE` return 403 for non-committee roles and succeed for committee
- [x] T12.2 — Implement `GET /api/newsletter/issues` (auth: any authenticated user) and `POST` / `PATCH /{id}` / `DELETE /{id}` (auth: `require_role("committee")`) in `apps/newsletter/api.py`; register the router in `config/api.py`

### T13 — Newsletter publish email notification

**Depends on:** T12, T6

- [x] T13.1 — Write tests first: publishing an issue (setting `published_at` for the first time) triggers exactly one call to `send_email` per subscribed member; publishing an already-published issue again does not re-send
- [x] T13.2 — Implement the notification: either a `post_save` signal on `NewsletterIssue` checking the transition to published, or an explicit call inside the "publish" API action — prefer the explicit call for clarity and testability over a signal
- [x] T13.3 — For now, treat every `User` as subscribed (send to all); leave a clearly-commented extension point (e.g. a `receives_newsletter_emails` boolean, default `True`) so unsubscribe can be added later without an API shape change

---

## Phase 5 — Backend: Central Directory Database

### T14 — `DirectoryEntry` model + admin

**Depends on:** T3

Kept intentionally generic since you'll define the real schema later.

- [x] T14.1 — Write tests first: model tests for default field values and that `created_by` is required
- [x] T14.2 — Implement `DirectoryEntry` in a new `apps/directory/` app: `title` (CharField), `description` (TextField, blank), `extra` (JSONField, default `dict`, for whatever ad-hoc fields you add before this gets a real schema), `created_by` FK to `User`, `created_at`, `updated_at`
- [x] T14.3 — Register in Django admin (committee can already reach it there too, as a fallback management path) with `list_display` on `title`, `created_by`, `created_at`
- [x] T14.4 — Seed a management command or fixture with 3–5 dummy entries for local dev/demo purposes

### T15 — Directory API endpoints with ownership permissions

**Depends on:** T10, T14

- [x] T15.1 — Write tests first, including a hypothesis property test over `(role, is_owner)` combinations: list/create allowed for `scout` and `committee` only; edit/delete allowed when `role == committee` OR (`role == scout` AND `is_owner`); denied in every other combination (including plain `member`)
- [x] T15.2 — Implement `GET /api/entries`, `POST /api/entries` (auth: `require_role("scout", "committee")`) and `PATCH /api/entries/{id}` / `DELETE /api/entries/{id}` (auth: role check + `is_owner_or_committee` from T10.3) in `apps/directory/api.py`; register the router in `config/api.py`
- [x] T15.3 — Ensure `created_by` is always set server-side from the authenticated user on create, never trusted from the request body

---

## Phase 6 — Backend: Wiring & Verification

### T16 — Register routers, finalize settings, full test run

**Depends on:** T7, T9, T12, T13, T15

- [ ] T16.1 — Confirm all new routers (`accounts` auth endpoints, `newsletter`, `directory`) are mounted under `/api/` in `config/api.py` and appear in `/api/docs`
- [ ] T16.2 — Update `backend/.env.example` with any new settings introduced along the way (OTP code TTL/cooldown values, confirm `RESEND_API_KEY` is documented, `FRONTEND_URL` if needed for cookie domain/CORS)
- [ ] T16.3 — Run `uv run pytest` (and/or `uv run python manage.py test`) for the full suite; run `uv run python manage.py check` to catch model/migration drift
- [ ] T16.4 — Sanity-check CORS/cookie settings still work for the `HttpOnly` refresh cookie given the existing `django-cors-headers` config (cookies require `CORS_ALLOW_CREDENTIALS = True` and a non-wildcard allowed origin)

---

## Phase 7 — Frontend: Auth Infrastructure

### T17 — Auth API client + zod schemas

**Depends on:** T16

- [ ] T17.1 — Add zod schemas for the auth payloads (`RequestCodeInput`, `VerifyCodeInput`, `AuthResponse`, `MeResponse`) in `frontend/src/shared/lib/` alongside existing API client conventions
- [ ] T17.2 — Add typed fetch functions (`requestCode(email)`, `verifyCode(email, code)`, `fetchMe()`) wired through TanStack React Query, matching how other API calls are structured elsewhere in the app

### T18 — `AuthContext` & token storage

**Depends on:** T17

- [ ] T18.1 — Write tests first (Vitest + React Testing Library): a test asserting `AuthContext` starts unauthenticated, becomes authenticated after a successful `verifyCode` call, and clears on logout/401
- [ ] T18.2 — Implement `AuthProvider` in `frontend/src/shared/lib/auth/` holding the access token + user (`role`, `email`) in React state (never localStorage, per the ADR); on mount, attempt a silent refresh using the `HttpOnly` cookie, then call `/api/accounts/me`
- [ ] T18.3 — Add an `apiFetch` wrapper (or extend the existing one) that attaches the access token, retries once on 401 via the refresh cookie, and surfaces a clean "logged out" state on repeated failure

### T19 — Register/Login page

**Depends on:** T18

- [ ] T19.1 — Write tests first: form submits email → shows code-entry step → submits code → redirects to the member area on success; shows an inline error on invalid code
- [ ] T19.2 — Build `frontend/src/pages/auth/AuthPage.tsx` as a two-step flow (email → code) using existing shared UI primitives and Tailwind conventions from other pages; add the route (e.g. `/join`) in `browser-router.tsx`

### T20 — Route guards

**Depends on:** T18

- [ ] T20.1 — Write tests first: an unauthenticated visit to a protected route redirects to `/join`; an authenticated `member` visiting a `committee`-only route is redirected/shown a 403-style page; a matching role passes through
- [ ] T20.2 — Implement `ProtectedRoute` (any authenticated user) and `RoleRoute` (specific roles) wrapper components; wire them into `browser-router.tsx` around the member-area routes added in Phase 8

### T21 — Navbar / `AppLayout` auth state

**Depends on:** T18

- [ ] T21.1 — Update the shared navbar to show "Join / Log in" when signed out and an account menu (email, role badge, log out) when signed in, following the existing header styling in `app/app-layout`

---

## Phase 8 — Frontend: Member Area

### T22 — Member dashboard shell with role-based widget registry

**Depends on:** T19, T20, T21

The layout of each role's page isn't fixed yet, so build the shell as a
registry rather than hard-coded per-role pages — this is the "convenient and
quick to implement later" requirement.

- [ ] T22.1 — Write tests first: given a mocked `AuthContext` user with role `member`, only member-eligible widgets render; given `scout`/`committee`, their additional widgets also render
- [ ] T22.2 — Build `frontend/src/pages/member/MemberDashboardPage.tsx` that reads `user.role` from `AuthContext` and renders a list of widget components filtered by a `visibleTo: Role[]` field declared alongside each widget, so adding a new widget later is a one-line registration, not a page rewrite
- [ ] T22.3 — Register the dashboard route behind `ProtectedRoute` from T20

### T23 — Newsletter page/widget

**Depends on:** T17, T22

- [ ] T23.1 — Write tests first: renders a loading state, then a list of published issues from a mocked API response
- [ ] T23.2 — Build the newsletter widget (visible to all roles) fetching `GET /api/newsletter/issues` via React Query, styled consistently with existing card/list patterns elsewhere in the app; register it in the widget registry from T22.2

### T24 — Directory/database management page

**Depends on:** T17, T22

- [ ] T24.1 — Write tests first: a `scout` sees edit/delete controls only on entries they created; a `committee` sees edit/delete on all entries; a `member` never sees this widget at all
- [ ] T24.2 — Build `frontend/src/pages/member/DirectoryPage.tsx` (or a dashboard widget) with a list/table of entries, a create form, and inline edit/delete gated per T24.1's rule — call the `/api/entries` endpoints from T15; register it in the widget registry, `visibleTo: [scout, committee]`

---

## Phase 9 — Docs & Rollout

### T25 — Update project docs

**Depends on:** T16, T24

- [ ] T25.1 — Update `AGENTS.md` repository layout section with the new `apps/newsletter/`, `apps/directory/` backend apps and the new `frontend/src/pages/auth/` and `frontend/src/pages/member/` directories
- [ ] T25.2 — Update `specs.md` §4 (Scope) and §9 (Future Considerations) to move "member sign-up/login," "newsletter signup," and the directory feature from _future_ to _in scope_, and note the passwordless design decision from the ADR

### T26 — Manual QA pass across all three roles

**Depends on:** T24, T25

- [ ] T26.1 — Create one test account per role (`member`, `scout`, `committee`) via the real email flow in a staging/local environment, elevating roles through the admin panel
- [ ] T26.2 — Walk through: registration email delivery, code expiry/lockout behavior, newsletter visibility, directory ownership rules (scout editing another scout's entry should fail, committee should succeed), and logout/session-refresh behavior
- [ ] T26.3 — Confirm `npm run lint`, `npm run build`, and the backend test suite (T16.3) all still pass before merging to `main`

---

## Notes / explicitly deferred (not part of this plan)

- Password-based login is _not_ implemented now — only the extension point
  from T1/T3 is put in place.
- Newsletter unsubscribe preferences, async/queued email sending (e.g. via
  Celery), and a real schema for `DirectoryEntry` are left as follow-ups once
  you've decided the actual shape of the data.
- Known pre-existing gaps (Contact form backend wiring, About page committee
  content, confirming `djangorestframework` removal in T2.3) are noted here
  but only the dependency-cleanup item is included above — the rest are
  unrelated to this feature set and worth their own todo pass.

## Implementation Notes & Design Decisions

### EmailOTP.email field length (low risk)

`EmailOTP.email` uses Django's default `EmailField(max_length=254)`. The
`st.emails()` strategy in hypothesis tests can theoretically generate addresses
exceeding this limit, though RFC-compliant addresses are typically much shorter.
**Mitigation:** Tests should filter generated emails to `len(e) <= 254` as a
defensive measure, though this is low risk in practice.

### Superuser role elevation (intentional design)

`UserManager.create_superuser()` sets `is_staff=True` and `is_superuser=True`
but leaves `role="member"` (the default). This is **intentional**, not an
oversight. The architecture separates concerns:

- `is_staff` / `is_superuser` → Django admin access (staff-gated)
- `role` → application-level API permissions (`require_role("committee")`)

A superuser with `role="member"` can access the admin panel and elevate their
own role via the Django admin UI, but won't pass API-level role checks until
they do. This aligns with the ADR and the principle that "Roles are elevated
manually by staff in the Django admin."

### Username field length constraint (FIXED)

**Issue:** `User.username` was `max_length=60` while `User.email` (the
`USERNAME_FIELD`) is `max_length=254`. Since `create_user()` defaults
`username = email`, hypothesis-generated emails > 60 chars would cause
DB-level `DataError` failures unrelated to the property under test.

**Fix:** Increased `User.username` to `max_length=254` to match the email
field. Migration `0004_alter_emailotp_expires_at_alter_user_username` applied.
This ensures the `username == email` invariant holds for all valid email
addresses without artificial length constraints.
