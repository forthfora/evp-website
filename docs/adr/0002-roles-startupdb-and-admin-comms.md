# ADR 0002: Roles, Startup Database & Admin Communications — Current Architecture

**Status:** Accepted (documents the as-built backend after the 2026-07 refactor)
**Date:** 2026-07-30
**Deciders:** EVP Committee
**Supersedes:** parts of ADR 0001 that referenced a planned newsletter/directory split

## Context

The backend was refactored after ADR 0001 and the original `todo-accounts.md`
plan were written. Several planned features were built differently, renamed,
or dropped, and the requirements themselves changed:

- The "central directory database" became the **startup database**
  (`apps/startupdb`, model `StartupEntry`).
- A fourth role, **Admin**, was added above Committee.
- The **newsletter feature was dropped**; there is no `apps/newsletter`.
  Instead, Admins write and send ad-hoc update emails to members.
- The backend (accounts, OTP auth, roles, startup CRUD, permissions) is
  **implemented but not extensively tested or reviewed**. The remaining work
  is primarily frontend integration, plus a small number of backend gaps.

This ADR records the architecture as it actually exists, the decisions behind
it, and the known issues that must be resolved.

## Current Architecture

### Roles (4, in ascending authority)

`apps/accounts/models.py::Role` — `member`, `scout`, `committee`, `admin`.
Elevation is manual via the Django admin (staff-gated); there is no
self-service role change.

| Capability                                   | Member | Scout | Committee | Admin |
| -------------------------------------------- | ------ | ----- | --------- | ----- |
| View startups database                       | ❌     | ✅    | ✅        | ✅    |
| Add startups/founders                        | ❌     | ✅    | ✅        | ✅    |
| Edit/delete **own** startups/founders        | ❌     | ✅    | ✅        | ✅    |
| Edit/delete **any** startup/founder          | ❌     | ❌    | ❌        | ✅    |
| View all members                             | ❌     | ❌    | ✅        | ✅    |
| Send update emails to all members            | ❌     | ❌    | ❌        | ✅    |
| Django admin panel                           | ❌     | ❌    | ❌        | ✅ (staff-gated) |

Key permission helpers in `apps/core/permissions.py`:

- `require_role(*roles)` — Django Ninja auth class (`RoleAuth(JWTAuth)`),
  used as `auth=require_role("scout", "committee", "admin")`.
- `can_manage_entry(user, entry)` — **admin** bypasses ownership;
  scout/committee may only manage entries where `entry.created_by == user`.
- `can_view_startups(user)` — scout/committee/admin.
- `can_send_notifications(user)` — **currently checks `is_committee` only and
  is unused** (see Known Issues).

### Accounts & auth (unchanged from ADR 0001)

- Passwordless OTP flow: `POST /api/auth/request-code` (202 always,
  60 s cooldown → 429) → `POST /api/auth/verify-code` (200 `{access}` +
  HttpOnly refresh cookie). Tokens issued manually to mirror
  `jwt_ninja.api.login`, sharing its `Session` model and cookie settings.
- `GET /api/accounts/me` (JWT) → `{email, role, date_joined}`.
- New users get unusable passwords and `role=member`.
- `User.receives_update_emails` (bool, default `True`) exists as the opt-out
  flag for admin update emails. Nothing consumes it yet.

### Startup database (`apps/startupdb`)

Two record types, both ownership-governed (`created_by` FK → User, CASCADE):

**`Founder`** (added 2026-07-30, implementation pending):

- `first_name` + `last_name` — composite natural key (unique together)
- `location`, `linkedin` (URL), `email`, `notes` — all optional
- `occupation` — choices: `bachelors`, `masters`, `phd`, `graduated`

**`StartupEntry`** (restructured 2026-07-30, implementation pending):

- `name` — unique (natural key)
- `founders` — **ManyToMany → `Founder`** (one or more per startup; replaces
  the old `founders` CharField)
- `founding_date`, `description`, `website`, `linkedin`, `email`,
  `location`, `notes`
- `created_by`, `created_at`, `updated_at`

The schema is **expected to grow** further; API schemas should track the
model closely.

Endpoints (all `auth=require_role("scout", "committee", "admin")`):

- `GET/POST /api/startupdb`, `PATCH/DELETE /api/startupdb/{id}` — startups
- `GET/POST /api/startupdb/founders`, `PATCH/DELETE /api/startupdb/founders/{id}`
  — founders (to be added with the `Founder` model)
- `created_by` forced server-side on create; PATCH/DELETE guarded by
  `can_manage_entry` (403 otherwise)

### Email

- `apps/core/email.py`: `send_email(to, subject, body)` via Resend SDK with a
  DEBUG/log-only fallback; `send_otp_email(email, code)` for auth.
- Transactional contact form (`POST /api/contact`) goes over SMTP via Resend.
- No broadcast/update-email endpoint exists yet.

## Decisions

1. **Admin is a role, not just `is_staff`.** Application-level authority lives
   in `User.role`; `is_staff`/`is_superuser` continue to gate only the Django
   admin panel. An Admin who should reach `/admin/` also needs `is_staff` set
   in the Django admin — two orthogonal switches, set together by convention.
2. **Committee currently equals Scout for startup permissions.** This is
   intentional and matches the requirement "currently, same permissions as
   scout, subject to change." `can_manage_entry` is the single choke point
   where a future Committee-elevated rule would be added.
3. **No newsletter models.** Admin communications are ad-hoc emails sent to
   all members with `receives_update_emails=True`. There is no persistent
   "issue" archive on the site. If an archive is wanted later it can be added
   without changing the send path.
4. **Startup schema evolves freely.** API schemas should track the model
   closely rather than exposing a deliberately thin subset.
5. **Founders are first-class records.** A `Founder` model with a composite
   natural key of `(first_name, last_name)` (unique together); startups link
   to founders via a many-to-many relation — a startup has one or more
   founders, and a founder may be attached to multiple startups.
   - *Why natural keys:* the database is small, human-curated, and has no
     other unique identifier for people; the requirement names first & last
     name as the key. Surrogate auto IDs remain as Django primary keys for
     FK stability; uniqueness on `(first_name, last_name)` enforces the
     natural-key rule.
   - *Trade-off accepted:* two different people with the same name cannot
     both be recorded without disambiguation (e.g. in `notes`), and exact
     duplicates from typos need manual cleanup. Fuzzy dedup/merge tooling is
     deferred.
   - *Why M2M over FK:* a founder can found or co-found several startups;
     a plain FK from Founder → Startup would force duplicate founder records.
6. **Same ownership rules for founders as startups.** `Founder.created_by`
   follows the `can_manage_entry` pattern: scouts/committee manage their
   own founder records, admin manages all. Editing a startup's founder
   *links* remains governed by the startup's `created_by`.

## Known Issues / To Be Resolved

1. **`can_send_notifications` checks the wrong role.** It returns True for
   `is_committee`, but per requirements only **Admin** sends update emails.
   Must be fixed (and used) when the send endpoint is built.
2. **No members-list endpoint.** Committee/Admin "view all members" has no
   API. Needed: `GET /api/accounts/members` behind
   `require_role("committee", "admin")`.
3. **No update-email endpoint.** Needed: `POST /api/updates/send` (or
   similar) behind `require_role("admin")`, iterating
   `User.objects.filter(receives_update_emails=True)` via
   `apps/core/email.py::send_email`.
4. **Startup schema restructure pending.** The `Founder` model and the new
   `StartupEntry` shape (unique `name`, M2M founders, `founding_date`,
   `linkedin`, `location`, `notes`) are specified but not yet implemented —
   see `todo-accounts.md` T1. The old `founders` CharField is replaced by
   the M2M relation; dev data can be discarded and re-seeded.
5. **`FROM_EMAIL` is the literal placeholder `"[EMAIL]"`** in settings —
   must be set to a verified Resend sender before any email feature ships.
6. **Docstring drift in `permissions.py`**: comments claim "committee may
   update any entry" but the code gives committee own-entry-only access
   (matching requirements). Fix the docstrings.
7. **`TYPE_CHECKING` imports in `permissions.py`** use a `backend.apps.*`
   path that doesn't match the apps-dir `sys.path` layout — type-check-only
   bug, harmless at runtime, worth correcting.
8. **Backend is not extensively tested.** Existing tests cover auth, OTP,
   permissions and startup CRUD (incl. hypothesis property tests), but the
   refactor has had no full review. Run the complete suite
   (`uv run pytest`, `uv run ruff check`, `manage.py check`) before building
   frontend features on top.
9. **Synchronous email fan-out.** Sending update emails to all members in the
   request cycle will be slow/fragile at scale. Acceptable for current
   membership size; a task queue is the documented follow-up if the list
   grows.
10. **Founder natural-key collisions.** `(first_name, last_name)` uniqueness
    blocks two genuinely different people who share a name, and case/spacing
    variants ("Ada Lovelace" vs "ada lovelace") will create duplicates unless
    normalized. Normalization (case-insensitive uniqueness) should be
    considered during implementation (T1); fuzzy merge tooling is deferred.

## Consequences

- Frontend work can begin against stable endpoints
  (`/api/auth/*`, `/api/accounts/me`, `/api/startupdb`) today.
- Three small backend additions (issues 1–3) are prerequisites for the
  members-list and admin-email frontend features, but not for auth or the
  startup database UI.
- The role/permission matrix above is the contract the frontend route guards
  and widget visibility rules must mirror exactly.
