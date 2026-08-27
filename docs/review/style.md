# Style Consistency Review

## Summary

Style is broadly consistent. Backend uses `from __future__ import annotations`
and modern typing; frontend uses aliases `@/`, `@assets/`, `@common/`.
Findings centre on small deviations: inconsistent use of `HttpRequest`
signature in some routes, side-effect CSS imports placement, and one
suspicious Tailwind class.

## Findings

### R6-1 — Inconsistent handler parameter naming in Ninja routers
- **Location**: `backend/apps/accounts/api.py` and `backend/apps/startupdb/api.py`
- **Description**: Several handlers use `request` untyped (e.g. `request_otp`, `logout_view`, `verify_otp`) while others type-hint `request: HttpRequest`. The project favours "type everything" per AGENTS.md.
- **Severity**: low
- **Evidence**: first few handlers lack the annotation; rest include it.
- **Recommendation**: unify to `request: HttpRequest` across handlers and
  rely on `from django.http import HttpRequest` under TYPE_CHECKING when
  preferred.

### R6-2 — Mixed import style between `.tsx/.ts` — alias vs relative
- **Location**: various `frontend/` pages & ui
- **Description**: Files are broadly consistent with `@common/` and `@/`
  aliases. Some import cycles occasionally resolve via relative imports.
- **Severity**: low
- **Evidence**: a quick scan shows aliases used almost everywhere; minor
  relative imports remain in header files.
- **Recommendation**: standardise on aliases; add an ESLint rule to enforce.

### R6-3 — Suspicious `grid-col-1` Tailwind class
- **Location**: [frontend/src/pages/member/MemberDashboardPage.tsx](frontend/src/pages/member/MemberDashboardPage.tsx#L62)
- **Description**: `className="grid-col-1 grid gap-6"` contains a typo
  (`grid-col-1` should be `grid-cols-1`).
- **Severity**: low
- **Evidence**: class is a no-op so it's harmless to the current layout.
- **Recommendation**: fix to `grid-cols-1` (kept under code-quality R3-6).

### R6-4 — Side-effect CSS import ordering
- **Location**: `frontend/src/shared/ui/header/AuthSection.tsx`
- **Description**: Styleguide says side-effect CSS imports go in the FIRST
  group (prefix `\0`). `AuthSection` correctly puts them first.
  Make this a convention rather than a fix.
- **Severity**: low
- **Evidence**: correctly ordered at the top.
- **Recommendation**: no action required; conventional note.

### R6-5 — Accounts router: path prefixes with trailing slash
- **Location**: [backend/apps/startupdb/api.py](backend/apps/startupdb/api.py)
- **Description**: startupdb router mounts blank `"/"` paths. This is a
  minor asymmetry with the `accounts` routes (`"/otp/request"`, `"/me"`,
  etc.).
- **Severity**: low
- **Evidence**: `"/"` for list and create; `"/{entry_id}"` for detail.
- **Recommendation**: rename `"/"` to `""` or `"/startups"` (callout is
  API-shape-aware; high risk). Recommend leaving as-is.
