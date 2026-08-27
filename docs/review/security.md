# Security Review (flagged only, no fixes planned)

## Summary

The backend and frontend have a solid baseline: session+CSRF auth,
role-based permissions at every endpoint, and rate limiting on every route.
Findings flag potentially-unwanted behaviour and gaps; they are *not*
addressed in the refactoring plan.

## Findings

### R7-1 — CSRF_TRUSTED_ORIGINS lists port 16016 (frontend runs on 16017)
- **Location**: [backend/config/settings.py](backend/config/settings.py#L44-L48)
- **Description**: `CSRF_TRUSTED_ORIGINS` includes `http://localhost:16016`
  and `http://[IP_ADDRESS]:16016` while the frontend is served on 16017.
  Django will reject CSRF token submissions from the local dev frontend.
- **Severity**: medium
- **Evidence**: mismatch — known issue #3 in AGENTS.md.
- **Recommendation**: FLAGGED (config mismatch) — see R8-3 in the
  dependencies review; noted as env-setting-only.

### R7-2 — Secret key required via env — fail-fast only when imported
- **Location**: [backend/config/settings.py](backend/config/settings.py#L20-L21)
- **Description**: `config("SECRET_KEY")` will raise on import if missing;
  acceptable. But `DEBUG` defaulting to `False` means production will also
  work without intentional opt-in — desirable.
- **Severity**: low
- **Evidence**: decouple-based config.
- **Recommendation**: FLAGGED — keep.

### R7-3 — `EmailOTP.max_attempts` property (constant)
- **Location**: [backend/apps/accounts/models.py](backend/apps/accounts/models.py#L160-L163)
- **Description**: `max_attempts` is a hard-coded property rather than a
  settings constant. A property is fine, but a settings knob would enable
  ops changes.
- **Severity**: low
- **Evidence**: `@property def max_attempts(self) -> int: return 5`
- **Recommendation**: FLAGGED — move to settings if operationally needed;
  not a defect.

### R7-4 — `list_members` leaks full member list to committee and admin
- **Location**: [backend/apps/accounts/api.py](backend/apps/accounts/api.py#L185-L204)
- **Description**: Per spec §4.3 committee should view members, so this is
  intentional. Full email/name exposure for all members is expected.
- **Severity**: low
- **Evidence**: `RoleAuth("admin", "committee")` gate is honoured.
- **Recommendation**: FLAGGED — intentional per spec; no change.

### R7-5 — `gsend_all_members_email` returns per-recipient failure counter only
- **Location**: [backend/apps/accounts/api.py](backend/apps/accounts/api.py#L209-L242)
- **Description**: Each user failure increments `failed` and logs locally.
  No user-emails are leaked in API response — good. But if
  `logger.exception` emits stack-frames including any user content, log
  retention policy matters; otherwise fine.
- **Severity**: low
- **Recommendation**: FLAGGED — log retention review only, no behaviour change.

### R7-6 — `HeaderActions` element refs passed into `ConfirmDialog`
- **Location**: [frontend/src/shared/ui/header/AuthSection.tsx](frontend/src/shared/ui/header/AuthSection.tsx)
- **Description**: The dialog receives `anchorRef` to an actual DOM element.
  Content isn't leaked, but ConfirmDialog should avoid leaking the element.
- **Severity**: low
- **Recommendation**: FLAGGED — not a leak; ignore.

### R7-7 — `request_otp` returns `exists` (user-enumeration aid)
- **Location**: [backend/apps/accounts/api.py](backend/apps/accounts/api.py#L40-L68)
- **Description**: The endpoint returns `exists` so the UI can branch to a
  unified login/signup — enabler design.
  Combined with rate limit (5/10m/ip) it makes full-email guessing slow,
  but the explicit enumeration signal remains.
- **Severity**: medium
- **Evidence**: `return RequestOTPOut(exists=exists)`.
- **Recommendation**: FLAGGED — trade-off acknowledged by the project;
  do not change behaviour per constraint 3. (Marked potentially-unwanted.)

### R7-8 — Sensitive values in no-Safe settings
- **Location**: [backend/config/settings.py](backend/config/settings.py)
- **Description**: `ALLOWED_HOSTS` includes literal `"[IP_ADDRESS]"` placeholder — won't match real traffic, could be confusing.
- **Severity**: low
- **Evidence**: redundant-or-placeholder host entries.
- **Recommendation**: FLAGGED — tighten `ALLOWED_HOSTS` (env-only action).
