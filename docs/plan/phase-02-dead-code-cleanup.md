# Phase 2: Dead code and unused module cleanup

- **Goal**: remove `helpers.exceptions` (dead), unused SMTP settings in
  Django settings, and the `send_welcome_email` dead function or wire it in
- **Depends on**: Phase 1
- **Risk level**: low
- **Files affected**:
  - `backend/helpers/` (delete)
  - `backend/config/api.py` (drop helpers import, simplify 404 handler)
  - `backend/config/settings.py` (drop SMTP block)
  - `backend/apps/core/email.py` (wire `send_welcome_email` on user creation, or remove)
- **Changes**:
  1. Remove `from helpers.exceptions import ResourceNotFound` in
     `backend/config/api.py` and simplify `not_found_handler` to label
     resources statically (`{"errors": {"resource": ["not found"]}}`).
     Resolves R1-1, R3-2.
  2. Delete `backend/helpers/exceptions.py` (and the `helpers/` package).
     Resolves R3-2.
  3. Remove the sys.path hack `sys.path.insert(0, str(BASE_DIR / "apps"))`
     from `backend/config/settings.py` *only after* verifying no production
     imports rely on it (rely on check phase). Resolves R1-1.
  4. Remove the SMTP fallback block (`EMAIL_BACKEND` smtp, `EMAIL_HOST`,
     `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`)
     from `backend/config/settings.py`. Resolves R3-1.
  5. Resolve `send_welcome_email` (R3-4): either call
     `send_welcome_email(user.email, user.first_name)` inside
     `verify_otp` when `created=True`, or remove the function from
     `apps/core/email.py`. Choose the removal if the project does not
     want a welcome email — that matches today's behaviour.
  6. Optionally drop `docs/adr/` references in `specs.md` (R4-1) or
     author ADRs. Recommend removal of the stale pointers.
- **Functionality preservation**: everything deleted is unreachable code or
  misleading config. R1-1's sys.path change is the only "guard" — need
  confirmation no file imports it. Verification uses full test suite.
- **Verification**:
  - `uv run python manage.py check` passes
  - `uv run python manage.py test` passes (no reference to helpers, no SMTP)
  - `uv run ruff check` passes (no unused imports)
  - Frontend `npm run build` and `npm run lint` (unaffected)
  - If welcome-email is wired, run email tests that exercise it
- **Rollback**: each file is independent; revert separately if any issue
  surfaces. The helpers deletion and sys.path removal should be done in one
  commit so checkpoints are clean.
