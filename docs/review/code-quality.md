# Code Quality and Self-Documentation Review

## Summary

Overall naming and typing discipline is high (modern typing on backend,
no-any types on frontend). Findings centre on dead code, one sys.path hack,
missing types in a few places, and a couple of stale doc comments.

## Findings

### R3-1 — `RESEND_ENABLED` override block uses complex cast
- **Location**: [backend/config/settings.py](backend/config/settings.py#L78-L83)
- **Description**: `RESEND_ENABLED` is forced off under the test runner via
  `if "test" in sys.argv`. That is fine, but the `RESEND_ENABLED` flag and
  SMTP fallback `EMAIL_BACKEND`/`EMAIL_HOST/...` settings are dead for real
  sends — the only path taken is the Resend SDK (see known issue #5). The
  SMTP block misleads readers.
- **Severity**: medium
- **Evidence**: `apps/core/email.py` only calls `resend.Emails.send`, never
  `django.core.mail`.
- **Recommendation**: delete the SMTP branch and the unused `EMAIL_*`
  settings; keep only `EMAIL_BACKEND` (console) in DEBUG.

### R3-2 — Dead `helpers.exceptions` module
- **Location**: [backend/helpers/exceptions.py](backend/helpers/exceptions.py),
  [backend/config/api.py](backend/config/api.py#L6)
- **Description**: `ResourceNotFound` is defined and one exception-handler
  in `config/api.py` checks `isinstance(exc, ResourceNotFound)`, but **no
  code raises it** — Django raises `Http404` and Ninja raises it via
  `get_object_or_404`. `_resource_from_path` TODO acknowledges this gap.
- **Severity**: medium
- **Evidence**: grep across `backend/` finds `ResourceNotFound` referenced
  only from `config/api.py` and its own definition.
- **Recommendation**: delete `helpers/` entirely and simplify the 404
  handler to use a static resource label, then resolve the sys.path hack
  (R1-1).

### R3-3 — `docs/adr/` directory referenced but does not exist
- **Location**: [docs/specs.md](docs/specs.md),
  [README.md](README.md) (old comment removed)
- **Description**: `specs.md` references ADR files (e.g.
  `docs/adr/0001-...`), but the directory was never created (see AGENTS.md
  known issue 6).
- **Severity**: low
- **Evidence**: `ls docs/` shows only `specs.md` and `todo-accounts-fixes.md`.
- **Recommendation**: either author ADRs or remove the stale references.

### R3-4 — `send_welcome_email` dead production function
- **Location**: [backend/apps/core/email.py](backend/apps/core/email.py#L203-L212)
- **Description**: `send_welcome_email(email, name)` is defined but never
  called from production code (grep across backend finds only the
  definition).
- **Severity**: low
- **Evidence**: single match in the definition file.
- **Recommendation**: either wire it into `verify_otp` on user creation or
  remove the function.

### R3-5 — Several Python type-ignore comments in account api
- **Location**: [backend/apps/accounts/api.py](backend/apps/accounts/api.py#L113-L123) and similar usages
- **Description**: `user: User = request.user  # type: ignore` suppresses
  the untyped `HttpRequest.user` from Django. While common, the pattern
  shows up repeatedly and could be centralised via a casted `HttpRequest`.
- **Severity**: low
- **Evidence**: `# type: ignore` comment appears in `accounts_me`, `update_me`,
  `change_email`, etc.
- **Recommendation**: keep as-is; Ninja and type checking of Django's
  `request.user` is an upstream limitation. Leave no-refactor.

### R3-6 — Frontend page-level blank grid class
- **Location**: [frontend/src/pages/member/MemberDashboardPage.tsx](frontend/src/pages/member/MemberDashboardPage.tsx#L62)
- **Description**: `className="grid-col-1 grid gap-6"` contains
  `grid-col-1` — not a valid Tailwind utility (correct: `grid-cols-1`).
  It evaluates to a no-op, masked by the flex layout.
- **Severity**: low
- **Evidence**: `grid-col-1` is not in generated utilities; typo for
  `grid-cols-1`.
- **Recommendation**: fix to `grid-cols-1` (or drop) in the same pass.

### R3-7 — Unused mailing-format `username` conversion comment
- **Location**: [backend/apps/accounts/models.py](backend/apps/accounts/models.py#L20-L22)
- **Description**: `generate_username()` returns `uuid.uuid4().hex`; fine.
  The comment above *is accurate*; the issue is that the `docstring` for
  this module only describes OTP/username — not role choices. Minor.
- **Severity**: low
- **Evidence**: top-of-file docstring absent for `Role` and `User`.
- **Recommendation**: skip; the names self-document. (Logged as a
  documentation note under R4-1, not a refactor candidate.)
