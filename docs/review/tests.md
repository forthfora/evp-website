# Test Quality Review

## Summary

Backend has a healthy test suite (accounts + core + startupdb ≈ 119 tests)
run via Django's runner with `uv run python manage.py test`. Frontend has
Vitest + @testing-library but only a few high-level tests exist. Known
flaky tests exist in `AuthPage.test.tsx`. Findings focus on missing frontend
coverage for critical flows and import/test-organisation consistency.

## Findings

### R5-1 — No frontend tests for apiFetch/CSRF bootstrap
- **Location**: [frontend/src/shared/lib/api.test.ts](frontend/src/shared/lib/api.test.ts)
- **Description**: `api.test.ts` exists but coverage for the critical
  features (`apiFetch` CSRF fetch/retry, `setUnauthorizedHandler`, error
  normalisation in `toApiRequestError`) should be verified. Frontend tests
  are sparse — only lib/auth/api + auth-context have test files.
- **Severity**: medium
- **Evidence**: file exists for `api.ts` and `auth-context.tsx`; no tests
  for member widgets or the 3-step auth flow page.
- **Recommendation**: add unit tests for `apiFetch` CSRF-retrieval and
  retry, `toApiRequestError` shape handling, `useAuthFlow` verification
  path (creating/owned), and `SettingsWidget` OTP email change — head of
  the critical flows.

### R5-2 — `AuthPage.test.tsx` has flaky tests
- **Location**: `frontend/src/pages/auth/` (referenced by repo memory)
- **Description**: Asserts `mockNavigate` was called with `/member` fails
  identically with all auth changes stashed — AnimatePresence `mode="wait"`
  timing in jsdom, not a real regression.
- **Severity**: medium
- **Evidence**: repo memory note (already-documented). Not caused by edits.
- **Recommendation**: isolate AnimatePresence or replace assertion with a
  waited-for expectation (e.g. `waitFor` on router state). Spot isn't
  needed for the refactor itself.

### R5-3 — Tests use pytest-style but run with Django's runner
- **Location**: [backend/pyproject.toml](backend/pyproject.toml#L33-L34)
- **Description**: pytest, pytest-django, and hypothesis are listed in dev
  deps, but tests are run via `uv run python manage.py test`. Imports of
  `pytest` in test modules are allowed despite this. Convention and
  dependency should align.
- **Severity**: low
- **Evidence**: `pyproject.toml` includes `pytest`, `pytest-django`,
  `freezegun`, `hypothesis`, in dev-deps; AGENTS.md says Django runner.
- **Recommendation**: remove pytest/pytest-django from dev-deps or switch
  the runner to `uv run pytest`. (Dependency concern also R8-2.)

### R5-4 — No test for the CSRF bootstrap
- **Location**: backend `apps/core/tests/test_email.py`, `apps/core/tests/test_permissions.py`
- **Description**: No test asserts `GET /api/csrf` returns a token cookie —
  an important bootstrap for the frontend.
- **Severity**: medium
- **Evidence**: only core email/permissions tests exist.
- **Recommendation**: add a small test for the `/api/csrf` endpoint shape.

### R5-5 — Missing test for the OTP lockout branch
- **Location**: [backend/apps/accounts/models.py](backend/apps/accounts/models.py#L107-L121)
- **Description**: OTP `max_attempts` lockout (5 attempts) and `is_valid`
  guard should be tested. `test_otp.py` covers throttle tiers; lockout path
  (correct code after too many wrong attempts) may not be.
- **Severity**: low
- **Evidence**: test list in `test_otp.py` covers throttle + expiry; branch
  coverage would show lockout as untested.
- **Recommendation**: add a single test hitting lockout.
