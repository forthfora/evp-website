# Documentation Review

## Summary

Inline documentation in this codebase is generally good and high-signal.
Findings are limited to a few stale references and a handful of
misleading guides; no request to add documentation where naming already
communicates intent.

## Findings

### R4-1 — `docs/adr/` references that point to non-existent files
- **Location**: [docs/specs.md](docs/specs.md),
  [README.md](README.md) (historical comment)
- **Description**: `specs.md` and earlier revision of `README.md` reference
  ADRs under `docs/adr/` (e.g. `0001`, `0002`) that were never created.
- **Severity**: low
- **Evidence**: `docs/` contains `specs.md` and `todo-accounts-fixes.md` only.
- **Recommendation**: remove or create the ADRs.

### R4-2 — OTP docstring claims unused
- **Location**: [backend/apps/accounts/models.py](backend/apps/accounts/models.py#L12-L22)
- **Description**: Both `get_otp_expiry()` and `generate_otp_code()` are
  correct. `generate_username()` however has no docstring — trivial.
- **Severity**: low
- **Evidence**: minor inconsistency in module-level docs; function names
  carry the load (self-documenting).
- **Recommendation**: no action required.

### R4-3 — `auth/api.ts` doc comment references stale `docs/todo.md`
- **Location**: [frontend/src/shared/lib/auth/api.ts](frontend/src/shared/lib/auth/api.ts#L30)
- **Description**: Comment `See docs/todo.md for the authoritative endpoint
  reference` — no `docs/todo.md` file exists; the actual endpoint source of
  truth is `docs/specs.md` §4.2.
- **Severity**: low
- **Evidence**: absent file.
- **Recommendation**: update the comment to point at `docs/specs.md` or
  remove the pointer.

### R4-4 — Accounts admin inline comments are excessive
- **Location**: [backend/apps/accounts/admin.py](backend/apps/accounts/admin.py#L10-L46)
- **Description**: `# defines the columns that will display`, `# defines
  filter sidebar options`, `# defines the edit/create form` — the Django
  field names are self-explanatory.
- **Severity**: low
- **Evidence**: noise-comments in a simple admin class.
- **Recommendation**: keep; removing comments has no behaviour effect but
  is also not required. Note as noise only.

### R4-5 — frontend `HeaderActions`/`HeroActions` wrapper docstring
- **Location**: [frontend/src/shared/ui/header/AuthSection.tsx](frontend/src/shared/ui/header/AuthSection.tsx)
- **Description**: Docstring is accurate; no action.
- **Severity**: low
- **Recommendation**: no action.
