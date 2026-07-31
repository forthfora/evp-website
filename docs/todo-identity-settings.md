# TODO — PLAN: User Identity (Stable Username ID), Login/Signup Flow & Account Settings

**Status:** ✅ Complete (T1–T9)
**Supersedes:** `docs/todo.md` (session-auth rework — ✅ complete). This plan builds
on top of it.

> **Implementation notes:**
> - Migration `0002_alter_user_...` reconciles the previously-unmigrated
>   `models.py` state: `username` is now unique with an auto-generated UUID
>   default (`generate_username`), `email` unique, names required.
> - The startupdb API exposes the creator as `created_by` (the creator's stable
>   `username` string). Response objects are built explicitly in `startupdb/api.py`
>   because the schema field name collides with the `created_by` FK.
> - `otp/request` now returns `{exists}` (account-existence is intentionally
>   revealed — it drives the login-vs-signup flow) and `otp/verify` returns
>   `{created}`.

## Requirements

1. **Stable global user ID** — the `username` field becomes a globally unique,
   immutable, auto-generated ID (created on account creation, never changes, not
   exposed publicly). It exists so a user's activity (e.g. `created_by` on
   startupdb records) stays attributable even if their email changes. The internal
   DB `id` must stop being exposed in API schemas.
2. **Unified login/signup** — first prompt is the email. Backend queries the DB:
   - **Match found** → send OTP, proceed straight to authentication (existing user).
   - **No match** → send OTP; once the code is confirmed, a new account is created,
     then the user is prompted for a **first and last name**.
3. **Account settings widget** — a new dashboard widget (all roles) letting a user:
   - change **email** (OTP sent to the new address; switched over once confirmed),
   - set **first name** / **last name**,
   - toggle **receives_update_emails** (update-email opt-in).

## Authoritative API reference (after this plan)

| Endpoint | Auth | In | Out |
| --- | --- | --- | --- |
| `POST /api/accounts/otp/request` | none | `{email}` | 200 `{exists}` / 500 |
| `POST /api/accounts/otp/verify` | none | `{email, code}` | 200 `{created}` / 401 |
| `POST /api/accounts/logout` | session | — | 204 / 401 |
| `GET /api/accounts/me` | session | — | `{username, email, role, date_joined, first_name, last_name, receives_update_emails}` |
| `PATCH /api/accounts/me` | session | `{first_name?, last_name?, receives_update_emails?}` | 200 `MeOut` |
| `POST /api/accounts/email/change` | session | `{email, code}` | 200 `MeOut` / 400 / 401 |
| `GET /api/accounts/members` | committee+ | — | `[{username, email, role, date_joined, receives_update_emails}]` |
| `POST /api/accounts/sendall` | admin | `{subject, body}` | `{subject, body, sent, skipped, failed}` |
| startupdb `FounderOut`/`StartupOut` | scout+ | — | `created_by_username` (was `created_by_id`) |

Notes:
- `username` is auto-generated (`uuid4().hex`), unique, never editable, never shown in UI.
- Migration state currently diverges from `models.py` (edited but unmigrated): the
  `0002` migration must reconcile username (unique + default), email (unique), and
  first/last name (non-blank).
- The `otp/request` `{exists}` flag intentionally reveals account existence — this is
  now a product requirement (distinguishes login vs signup).

## Legend
- Task IDs `T#`. **Depends on:** lists prerequisites.

---

## Phase 0 — Backend: stable unique username ID

### T1 — `username` becomes an auto-generated immutable unique ID

**Depends on:** none

- [x] T1.1 — `apps/accounts/models.py`: add `generate_username()` (UUID hex); set
  `username = CharField(unique=True, default=generate_username)`; drop `username`
  from `REQUIRED_FIELDS`; update `UserManager.create_user` so username is only set
  when explicitly passed (never defaulting to email).
- [x] T1.2 — Update model tests (`test_models.py`): username is auto-generated,
  unique, and **not** the email; stable across email changes.
- [x] T1.3 — `makemigrations` + `migrate` (reconciles 0001 stock-`AbstractUser`
  state with the new model); confirm tests pass.

### T2 — Expose `username`, stop exposing DB `id`

**Depends on:** T1

- [x] T2.1 — `apps/accounts/schemas.py`: `MeOut.id` → `MeOut.username` (+
  `first_name`, `last_name`, `receives_update_emails`); `MemberOut.id` →
  `MemberOut.username`.
- [x] T2.2 — `apps/accounts/api.py`: `accounts_me` and `list_members` emit
  `username` instead of `id`.
- [x] T2.3 — startupdb: add `created_by_username` property to `Founder` and
  `StartupEntry`; replace `created_by_id` with `created_by_username` in
  `FounderOut`/`StartupOut`.
- [x] T2.4 — Update affected tests (accounts `me`/`members`, startupdb API) and run
  the full backend suite + ruff.

---

## Phase 1 — Backend: login/signup flow + profile & email endpoints

### T3 — OTP endpoints distinguish existing vs new users

**Depends on:** T1

- [x] T3.1 — `POST /api/accounts/otp/request` returns `200 {exists: bool}` (queries
  `User` by email) instead of 204.
- [x] T3.2 — `POST /api/accounts/otp/verify` returns `200 {created: bool}` (account
  auto-created on first-time verification with a generated username) instead of 204.
- [x] T3.3 — Update `test_auth_api.py` (status codes, `{exists}`/`{created}`
  payloads, new-vs-existing assertions).

### T4 — Profile update + email change endpoints

**Depends on:** T2

- [x] T4.1 — `PATCH /api/accounts/me` (session auth): partial update of
  `first_name`, `last_name`, `receives_update_emails`; returns `MeOut`.
- [x] T4.2 — `POST /api/accounts/email/change` (session auth): `{email, code}`;
  consume the OTP for the new email; reject if the email belongs to another user
  (400); switch `user.email`; returns `MeOut`. Extract shared OTP-consume helper.
- [x] T4.3 — Tests for T4.1/T4.2 (auth required, name/opt-in update, email switch,
  duplicate-email 400, bad-code 401).

---

## Phase 2 — Frontend: schemas & API client

### T5 — Update auth + startupdb clients

**Depends on:** T2, T3, T4

- [x] T5.1 — `auth/schemas.ts`: `MeResponse` = `{username, email, role,
  date_joined, first_name, last_name, receives_update_emails}`; `MemberOut` uses
  `username`; add `RequestOTPOut`/`VerifyOTPOut`, `UpdateMeInput`,
  `ChangeEmailInput`.
- [x] T5.2 — `auth/api.ts`: `requestOtp` returns `{exists}`; `verifyOtp` returns
  `{created}`; add `updateMe()` (PATCH /me) + `useUpdateMe`, `changeEmail()` +
  `useChangeEmail`.
- [x] T5.3 — `startupdb/api.ts`: `created_by_username` in `FounderOut`/
  `StartupOut`; update `StartupDatabaseWidget` ownership gating
  (`user.username` vs `created_by_username`) and `MembersWidget` keys.

---

## Phase 3 — Frontend: auth flow & settings widget

### T6 — Unified AuthPage flow (email → code → names for new users)

**Depends on:** T5

- [x] T6.1 — `AuthPage.tsx`: `email` step calls request → stores `{exists}`; `code`
  step → verify → `login()` → if `{created}` go to `names` step else `/member`;
  `names` step prompts first/last name → `updateMe` → `/member`.
- [x] T6.2 — Update `AuthPage.test.tsx` (existing-user path, new-user names path).

### T7 — Account Settings widget

**Depends on:** T5

- [x] T7.1 — New `SettingsWidget` (`visibleTo: [member, scout, committee, admin]`):
  name fields (save via `updateMe`), email change (new email → OTP → confirm via
  `changeEmail`), update-email opt-in toggle. Refresh context user after saves.
- [x] T7.2 — Register in `widgets/index.ts`; add widget test; update
  `MemberDashboardPage.test.tsx` mock (username/names in `MeResponse`).

### T8 — Frontend QA

**Depends on:** T6, T7

- [x] T8.1 — `npm run lint`, `npx vitest run`, `npm run build` all green.

---

## Phase 4 — Docs

### T9 — Documentation updates

**Depends on:** T8

- [x] T9.1 — `AGENTS.md`: username = stable auto-generated global ID (not shown);
  OTP endpoints return `{exists}`/`{created}`; `PATCH /me`, `POST
  /accounts/email/change`; startupdb `created_by_username`.
- [x] T9.2 — `docs/specs.md`: §4/§5 — unified login/signup, account settings, stable
  user ID.
- [x] T9.3 — `docs/todo-accounts.md` + this file marked complete; superseded notes.

---

## Out of scope / deferred
- Password-based login (unchanged).
- Public surfacing of any user ID (username is internal-only).
- Email preference self-service beyond the opt-in toggle.
