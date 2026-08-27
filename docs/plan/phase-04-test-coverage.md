# Phase 4: Targeted test coverage

- **Goal**: add the smallest set of tests that close the highest-risk gaps —
  apiFetch CSRF handling, OTP lockout, `/api/csrf` endpoint — without
  restructuring any modules
- **Depends on**: Phase 1-3
- **Risk level**: low (tests only)
- **Files affected**:
  - `frontend/src/shared/lib/api.test.ts` (extend)
  - `backend/apps/accounts/tests/test_otp.py` (extend)
  - `backend/apps/core/tests/` (new `test_csrf_endpoint.py`)
  - `frontend/src/shared/lib/auth/auth-context.test.tsx` (extend or
    supplement)
- **Changes**:
  1. Add cases to `frontend/src/shared/lib/api.test.ts` exercising the
     CSRF bootstrap: first mutating call fetches token, second uses cached,
     HTML 403 → reset+retry, JSON 403 → no retry. Resolves R5-1.
  2. Add a unit test for the OTP lockout: consuming 5 wrong attempts makes
     a subsequent correct-code consume fail. Resolves R5-5.
  3. Add a small `test_csrf_endpoint.py` in `backend/apps/core/tests/`
     confirming that `GET /api/csrf` returns a cookie and a non-empty body.
     Resolves R5-4.
  4. Resolve the pytest-vs-manage.py runner mismatch (R5-3/R8-5) by
     deciding on one: keep `uv run python manage.py test` (drop
     pytest/pytest-django from dev-deps) or switch to pytest. The
     recommendation is to keep the Django runner and prune the deps.
  5. Optionally, add one Widget-level test (Settings or MembersWidget)
     rendering leaves/loads to validate the extraction in Phase 3.
     Resolves R5-1 further.
- **Functionality preservation**: tests-only. No production behaviour is
  altered. Any lib change (e.g. removing pytest deps) keeps the active
  runner command (`manage.py test`) sufficient.
- **Verification**:
  - `uv run python manage.py test` passes with all new cases
  - Frontend `npm run test` passes with all new cases
  - If deps are pruned, `uv sync` refreshes `uv.lock`
- **Rollback**: tests are additive — revert by removing the new test files.
  The deps decision should not roll back features.
