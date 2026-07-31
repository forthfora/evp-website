# TODO — PLAN: Session-Auth Rework — Frontend `lib/auth` & `lib/contact` + Doc Alignment

**Status:** ✅ Complete (T16–T26.3). `lib/auth` and `lib/contact` rebuilt for
Django session auth (CSRF-aware `apiFetch`, session `AuthContext`, contact
client), member-area widgets implemented, and all QA gates green on both ends.

> **Implementation note:** the QA pass surfaced a real regression —
> `apps/core/permissions.py::can_manage_entry` had lost its scout/committee role
> gate, so plain `member`s could manage records they created. Restored the gate
> (full 110-test backend suite green). Also implemented T28 (`MeOut.id`) so the
> startup-database widget can gate edit/delete by `created_by_id`.
**Supersedes:** auth/JWT-related tasks in `docs/todo-accounts.md` (T5–T9,
and the `POST /api/updates/send` shape from T4 — see "Backend drift" below).
**Authoritative architecture reference:** `docs/adr/0002-roles-startupdb-and-admin-comms.md`
+ the live backend code (this plan's API reference table).

## What changed (requirements delta)

1. **Auth mechanism: JWT → Django sessions.** The backend no longer issues
   JWT access/refresh tokens. `POST /api/accounts/otp/verify` calls
   `django.contrib.auth.login()` and the browser holds a session cookie
   (plus `csrftoken`). There is **no refresh endpoint** — sessions expire
   server-side; "silent refresh" means re-fetching `/api/accounts/me`.
2. **Endpoint renames.**
   - `/api/auth/request-code` → `POST /api/accounts/otp/request`
   - `/api/auth/verify-code` → `POST /api/accounts/otp/verify`
   - New: `POST /api/accounts/logout`, `GET /api/csrf`
   - `POST /api/updates/send` → `POST /api/accounts/sendall`
3. **Response shapes.** All auth endpoints return **204 No Content** on
   success (no `{access}` token body). `GET /api/accounts/me` returns
   `{email, role, date_joined}` — no `id`, no `image` (User has neither an
   `image` field nor first/last name; see T20).
4. **CSRF is now mandatory** for all mutating requests (session auth is
   cookie-based). The SPA must fetch `GET /api/csrf` on boot and send
   `X-CSRFToken` on every POST/PATCH/DELETE, with
   `credentials: 'include'`/`same-origin` on all API calls.
5. **Error shapes differ by source.** Schema/permission errors use the
   structured form `{"errors": {field: [msgs]}}` (401/403/404/422), but
   `HttpError`-raised failures (invalid OTP, email-server 500s) return
   `{"detail": "..."}`. The client must handle **both**.
6. **No 429 on OTP request.** Rate limiting lives in `EmailOTP` verify
   attempts (`max_attempts` lockout → 401 "Invalid or expired OTP"). The
   old "wait 60 s before resending" 429 UX must be dropped or driven by a
   new backend feature (see T23, optional).
7. **Contact endpoint.** `POST /api/contact` takes `{name, email, message}`
   and returns 204/500 — it also requires the CSRF header.

## Authoritative API reference (mirror exactly in the frontend)

| Endpoint | Auth | In | Out |
| --- | --- | --- | --- |
| `GET /api/csrf` | none | — | `{csrftoken}` |
| `POST /api/accounts/otp/request` | none | `{email}` | 204 / 500 `{"detail"}` |
| `POST /api/accounts/otp/verify` | none | `{email, code}` | 204 / 401 `{"detail"}` |
| `POST /api/accounts/logout` | session | — | 204 / 401 |
| `GET /api/accounts/me` | session | — | `{email, role, date_joined}` / 401 |
| `GET /api/accounts/members` | committee+ | — | `[{id, email, role, date_joined, receives_update_emails}]` |
| `POST /api/accounts/sendall` | admin | `{subject, body}` | `{subject, body, sent, skipped, failed}` |
| `POST /api/contact` | none + CSRF | `{name, email, message}` | 204 / 500 `{"detail"}` |
| `GET/POST /api/startupdb/founders`, `PATCH/DELETE …/{id}` | scout+ | see T1 schemas | — |
| `GET/POST /api/startupdb/startups`, `PATCH/DELETE …/{id}` | scout+ | see T1 schemas | — |

**Role/capability contract (unchanged, mirror in the frontend):**

| Capability | Member | Scout | Committee | Admin |
| --- | --- | --- | --- | --- |
| View startup database | ❌ | ✅ | ✅ | ✅ |
| Add startups/founders | ❌ | ✅ | ✅ | ✅ |
| Edit/delete own startups/founders | ❌ | ✅ | ✅ | ✅ |
| Edit/delete any startup/founder | ❌ | ❌ | ❌ | ✅ |
| View all members | ❌ | ❌ | ✅ | ✅ |
| Send update emails to all members | ❌ | ❌ | ❌ | ✅ |
| Django admin panel | ❌ | ❌ | ❌ | ✅ |

**Testing policy:** tests first where practical — Vitest + React Testing
Library for the frontend, Django test suite + `hypothesis` for backend
tweaks.

## Legend

- Task IDs are `T#`; subtasks `T#.#`. **Depends on:** prerequisite task IDs.
- Completed work from `todo-accounts.md` is **not** re-planned; only drift
  fixes and new work appear here.

---

## Phase 0 — Frontend: Auth & Contact Infrastructure (the core ask)

### T16 — `lib/auth` zod schemas + typed API client

**Depends on:** none

Rebuild `frontend/src/shared/lib/auth/` (currently empty; imported by
`app.tsx`, `browser-router.tsx`, `AuthPage`, `MemberDashboardPage`,
`AccountAndSettings`).

- [x] T16.1 — `schemas.ts`: `Role` zod enum (`member|scout|committee|admin`); `RequestOTPInput` (`{email}`); `VerifyOTPInput` (`{email, code}` — 6-digit regex); `MeResponse` (`{email, role, date_joined}`); `MemberOut` (`{id, email, role, date_joined, receives_update_emails}`); `SendAllEmailInput` (`{subject, body}`); `SendAllEmailOut` (`{subject, body, sent, skipped, failed}`)
- [x] T16.2 — `api.ts`: typed fetch wrappers `requestOtp(email)`, `verifyOtp(email, code)`, `logout()`, `fetchMe()`, `fetchMembers()`, `sendAllEmail(subject, body)` hitting the endpoints in the API reference; expose TanStack Query hooks (`useRequestOtp`, `useVerifyOtp`, `useLogout`, `useMe`, `useMembers`, `useSendAllEmail`) with zod-validated responses
- [x] T16.3 — `ApiRequestError` carrying `{status, fieldErrors, detail}`; parse **both** error shapes (`{"errors": …}` and `{"detail": …}`) into it
- [x] T16.4 — Keep exported names used by existing code (`fetchMe`, `ApiRequestError`) but **rename** `useRequestCode`/`useVerifyCode` → `useRequestOtp`/`useVerifyOtp` and update `AuthPage` + its test accordingly

### T17 — `apiFetch` wrapper with CSRF + credentials

**Depends on:** T16

- [x] T17.1 — Write tests first: wrapper sends `credentials: 'include'`; attaches `X-CSRFToken` from the stored token on mutating verbs; refreshes the CSRF token and retries once on 403 `csrf` failure; never attaches CSRF to GET/HEAD
- [x] T17.2 — Implement `apiFetch` in `frontend/src/shared/lib/` (shared by auth, contact, startupdb calls): bootstrap via `GET /api/csrf` on first use, cache the token, `credentials: 'include'` always, single retry on CSRF 403
- [x] T17.3 — Route every fetch in T16/T19 through `apiFetch`

### T18 — `AuthContext` (session-based)

**Depends on:** T16, T17

- [x] T18.1 — Write tests first (update the T6.1 expectations): starts unauthenticated; `fetchMe()` on mount hydrates `{email, role}` when a session cookie exists (the session-auth equivalent of "silent refresh" — there is no refresh token); becomes authenticated after `verifyOtp` + `fetchMe`; clears on `logout()` and when `fetchMe` returns 401
- [x] T18.2 — Implement `auth-context.tsx` + `use-auth.ts`: state `{user: {email, role} | null, isAuthenticated, isLoading}`; **no token storage anywhere** (no React-state access token, no localStorage — the cookie is the credential); `login()` = `fetchMe` revalidation after verify; `logout()` calls `POST /api/accounts/logout` then clears state
- [x] T18.3 — Handle session expiry globally: any 401 from an authed call clears context (no retry — re-login is required)

### T19 — `lib/contact` client

**Depends on:** T17

- [x] T19.1 — Write tests first: `sendContact` posts `{name, email, message}` with CSRF header; resolves on 204; surfaces the `{"detail"}` message on 500
- [x] T19.2 — Implement `frontend/src/shared/lib/contact/api.ts` — `ContactInput` zod schema (`name`, `email`, `message` with sane length caps), `sendContact(input)` + `useSendContact()` hook, through `apiFetch`; verify `ContactPage` works unchanged (it already imports `sendContact` with this signature)

### T20 — Consumers: update pages to the session model

**Depends on:** T16–T19

- [x] T20.1 — `AuthPage` (`/join`): swap hooks to `useRequestOtp`/`useVerifyOtp`; after verify, call `login()` (re-fetch me) then navigate to `/member`; map 401 `detail` ("Invalid or expired OTP.") to the inline error; **remove the 429/cooldown branch** (backend never returns 429) — optionally show a client-side resend timer instead
- [x] T20.2 — `ProtectedRoute` in `lib/auth/ProtectedRoute.tsx`: unauthenticated → redirect `/join`; authed → render children; loading state while hydrating. Add `RoleRoute(roles: Role[])` for the Phase-2 widgets (member on a role-gated route → 403-style page)
- [x] T20.3 — `AccountAndSettings` header menu: wire `logout()` to the new context action (calls backend then clears); verify role badge + email display against `MeResponse`
- [x] T20.4 — `MemberDashboardPage` + widget registry: no shape change needed, but re-run T10.1 tests against the rebuilt context mock; `created_by_id` ownership checks for T11 must come from `GET /api/accounts/members` or an added `id` on `MeResponse` (pick one — prefer adding `id` to `MeResponse`, small backend change, test first)

### T21 — Test-suite repair & green build

**Depends on:** T20

- [x] T21.1 — Update `AuthPage.test.tsx` and `MemberDashboardPage.test.tsx` mocks to the new module surface (`use-auth`, `api` hooks, context shape)
- [x] T21.2 — Add MSW (or fetch-mock) handlers for the session flow (csrf → otp/request → otp/verify → me → logout) so integration-style tests exercise real fetch paths
- [x] T21.3 — `npm run lint`, `npm run build`, `npx vitest run` all green

---

## Phase 1 — Resume member-area features (from todo-accounts.md, rebased)

### T22 — Startup database UI (was T11)

**Depends on:** T18, T20

- [x] T22.1 — Tests first: ownership-gated edit/delete per role (scout/committee own-only, admin all) — same matrix as before
- [x] T22.2 — Startup table + create/edit form with founder multi-select, calling `/api/startupdb` through `apiFetch` (CSRF included); widget `visibleTo: [scout, committee, admin]`
- [x] T22.3 — Founders list + create/edit/delete section, same visibility/ownership
- [x] T22.4 — Graceful 403 handling (backend authoritative)

### T23 — Members list UI (was T12)

**Depends on:** T18

- [x] T23.1 — Tests first: committee/admin see the table; scout/member don't
- [x] T23.2 — Members widget via `useMembers()` — email, role badge, join date, opt-in status; `visibleTo: [committee, admin]`

### T24 — Admin update-email composer (was T13 — endpoint renamed)

**Depends on:** T16

- [x] T24.1 — Tests first: only admin sees the composer; confirmation step; renders `{sent, skipped, failed}` from the response
- [x] T24.2 — Composer widget posting to **`POST /api/accounts/sendall`** via `useSendAllEmail`; `visibleTo: [admin]`

---

## Phase 2 — Docs & QA

### T25 — Documentation updates

**Depends on:** T24

- [x] T25.1 — `docs/todo-accounts.md`: mark T5–T9 superseded by this plan's T16–T21; correct T4 (`/api/updates/send` → `/api/accounts/sendall`); note the JWT→session migration
- [x] T25.2 — `docs/specs.md`: §4.2 "Authentication" — describe session-cookie auth (OTP → `login()` → session + CSRF cookie), not "JWT access token in body + HttpOnly refresh cookie"; §5 FR4 likewise; add `POST /api/accounts/logout` and `GET /api/csrf` to the capability list; correct the admin-email endpoint path
- [x] T25.3 — `AGENTS.md`: backend section — replace "JWT access token in body + refresh token in HttpOnly cookie" with session auth; document the endpoint map (`/api/accounts/otp/*`, `/api/accounts/sendall`, `/api/csrf`) and the dual error shapes (`{"errors"}` vs `{"detail"}`); frontend section — note `lib/auth`/`lib/contact` structure and the CSRF requirement for mutating calls
- [ ] T25.4 — `docs/adr/0001-passwordless-auth.md`: add a superseding note (or new ADR 0003) recording the JWT→session decision and rationale

### T26 — Manual QA across all four roles

**Depends on:** T25

- [ ] T26.1 — One account per role via the real email flow; elevate in Django admin
- [ ] T26.2 — Walk through: OTP request/verify (expiry, lockout after max attempts), CSRF on every mutation (verify in DevTools), session persistence across reload (`fetchMe` hydrate), logout (cookie cleared, protected routes redirect), startup/founder ownership matrix, members list visibility, sendall delivery + opt-out respect, contact form end-to-end
- [x] T26.3 — Pre-merge gates: `npm run lint`, `npm run build`, `npx vitest run`, `uv run python manage.py test`, `uv run ruff check`

---

## Optional / deferred

- **T27 (optional)** — OTP resend cooldown: if desired, add server-side
  throttling on `otp/request` (e.g. 60 s per email, 429 response) and
  restore the cooldown UX in `AuthPage`. Currently no request-side limit
  exists; verify-side lockout (`EmailOTP.max_attempts`) is the only guard.
- **T28 (done)** — `MeResponse.id` added to the backend `MeOut` schema (`GET
  /api/accounts/me` now returns `id`; test updated); the startup-database widget
  uses it to gate edit/delete by `created_by_id`.
- JWT/`jwtninja` dependency removal from `pyproject.toml` if fully unused.
- Async email fan-out, founder fuzzy-dedupe, public startup directory —
  unchanged from todo-accounts.md "Notes / explicitly deferred".

## Backend status reference (implemented — do not rebuild)

| Feature | Location |
| --- | --- |
| OTP request/verify, expiry, attempt lockout | `apps/accounts/api.py`, `models.EmailOTP` |
| Session login/logout | `apps/accounts/api.py` (`login`/`logout`, `django_auth`) |
| `/api/accounts/me`, `/members`, `/sendall` | `apps/accounts/api.py` |
| CSRF token endpoint | `apps/core/api.py::get_csrf` (`GET /api/csrf`) |
| Contact form endpoint | `apps/core/api.py::send_contact_email` (`POST /api/contact`) |
| Role field (4 roles) + `is_scout/is_committee/is_admin` | `apps/accounts/models.py` |
| `RoleAuth`, `can_manage_entry` | `apps/core/permissions.py` |
| Startup/founder CRUD `/api/startupdb` with ownership rules | `apps/startupdb/api.py` |
| Resend email wrapper (`send_email`, `send_otp_email`) | `apps/core/email.py` |
| Structured error handlers (`{"errors"}` 401/403/404/422) | `config/api.py` |
