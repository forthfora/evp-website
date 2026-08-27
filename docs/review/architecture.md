# Architecture and Structure Review

## Summary

The overall decoupled SPA+API layout is sound and app boundaries are clear
(accounts/core/startupdb, shared/lib for client modules). A few structural
rough edges exist: an empty helpers package mounted via a sys.path hack,
thin wrapper views duplicated between HeaderActions and HeroActions,
and router mounting patterns that diverge between accounts and startupdb.

## Findings

### R1-1 — `helpers` module mounted via `sys.path` mutation
- **Location**: [backend/config/settings.py](backend/config/settings.py#L17-L18)
- **Description**: `sys.path.insert(0, str(BASE_DIR / "apps"))` plus a top-level
  `helpers/` package solely to support `from helpers.exceptions import ResourceNotFound`
  (which itself is dead, see R3-2). The `sys.path` hack silently changes how all
  `import` resolution works across the whole backend.
- **Severity**: medium
- **Evidence**: single-import module, one class, no other users.
- **Recommendation**: either move `helpers` into `apps/core/helpers` as a
  normal submodule, or delete it (R3-2 recommends deletion). If retained,
  have `config/api.py` import it via an absolute package from `apps.core`.

### R1-2 — Thin wrapper views for HeaderActions/HeroActions
- **Location**: [frontend/src/shared/ui/header/HeaderActions.tsx](frontend/src/shared/ui/header/HeaderActions.tsx), [frontend/src/shared/ui/header/HeroActions.tsx](frontend/src/shared/ui/header/HeroActions.tsx)
- **Description**: Both files exist only to wrap `AuthSection` with a different
  default `size` prop (`default` vs `large`), layering an extra component and
  file where a prop is enough.
- **Severity**: low
- **Evidence**: `HeaderActions` renders `AuthSection`, `HeroActions` renders
  `AuthSection size="large"`.
- **Recommendation**: inline `AuthSection` where the two wrappers are used
  and drop both files.

### R1-3 — Inconsistent router mount patterns across Ninja apps
- **Location**: [backend/config/api.py](backend/config/api.py#L71-L73),
  [backend/apps/startupdb/api.py](backend/apps/startupdb/api.py#L22)
- **Description**: `accounts` uses a bare router with auth declared per-route;
  `startupdb` mounts a router with a router-level `auth=RoleAuth(...)` and then
  blank `/` routes (`"/"`), while `core` uses a bare router. Different
  conventions make it hard to know the uniform pattern when adding routes.
- **Severity**: low
- **Evidence**: startupdb router has `auth=RoleAuth("admin","committee","scout")`
  at the router level and two blank `"/"` handlers; accounts/@router handler
  paths include explicit subpaths like `"/otp/request"`.
- **Recommendation**: standardise on router-level auth only where it
  genuinely applies to all routes; use trailing slash-free paths consistently.

### R1-4 — Frontend `HeaderActions` vs `HeroActions` naming
- **Location**: [frontend/src/shared/ui/header/](frontend/src/shared/ui/header/)
- **Description**: Under `ui/header/`, "Header" refers to two different things
  — the sticky top navigation (`Header.tsx`) and *either* of `HeaderActions`
  (top bar) / `HeroActions` (hero of the home page). The names blur intent.
- **Severity**: low
- **Evidence**: `HeaderActions` is a small fixed-position controls strip;
  `HeroActions` centers auth CTA on the hero.
- **Recommendation**: once R1-2 removes the wrappers, the ambiguity
  disappears. Until then, consider naming them for their visual context
  (e.g. `TopBarActions`, `HeroCtaActions`).

### R1-5 — Member dashboard widget/page split
- **Location**: [frontend/src/pages/member/dashboard/DashboardPages.data.ts](frontend/src/pages/member/dashboard/DashboardPages.data.ts),
  [frontend/src/pages/member/widgets/index.ts](frontend/src/pages/member/widgets/index.ts)
- **Description**: Widgets live under `widgets/` and pages/data under
  `dashboard/`. The page registry (`DASHBOARD_PAGES`) references widget ids
  by string. This split is intentional and works; it is **not** a finding —
  it is a positive note: the registry + hash routing pattern is legible.
- **Severity**: low
- **Evidence**: `DASHBOARD_PAGES` maps id→widgetIds, role-gated by
  `visibleTo` in `widgetRegistry`.
- **Recommendation**: keep the pattern; no refactor needed.
