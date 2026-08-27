# Code Duplication Review

## Summary

Duplication is modest overall. The notable clusters are: (1) the two
`_founder_out` / `_startup_out` serializers in startupdb repeat the field-by-field
mapping pattern (justified by the Ninja FK-schema gotcha but still
boilerplate); (2) accounts/me, accounts/members, and change-email handlers
each build the same `MeOut`/`MemberOut` shape manually; and (3) the auth
widget's className constants (`inputClass`, `labelClass`, button bars) are
redeclared across Settings, AdminUpdates, Members, and auth steps.

## Findings

### R2-1 — Repeated per-widget Tailwind class constants
- **Location**: [frontend/src/pages/member/widgets/SettingsWidget.tsx](frontend/src/pages/member/widgets/SettingsWidget.tsx#L9-L16),
  [frontend/src/pages/member/widgets/AdminUpdatesWidget.tsx](frontend/src/pages/member/widgets/AdminUpdatesWidget.tsx#L7-L9),
  [frontend/src/pages/auth/styles.ts](frontend/src/pages/auth/styles.ts)
- **Description**: `inputClass`, `labelClass`, primary/ghost button classes
  are copy-pasted between the member widgets and the auth flow steps. When
  the styling drifts one place it must be updated in several.
- **Severity**: low
- **Evidence**: identical comment-free `inputClass` literal appears in
  SettingsWidget, AdminUpdatesWidget (slightly duplicated subset), and in
  `pages/auth/styles.ts` used by EmailStep/CodeStep/NamesStep.
- **Recommendation**: move the className constants to one shared module
  (`shared/ui/formClasses.ts` or under `shared/styles/`), and import.

### R2-2 — `MeOut`/`MemberOut` serializers re-built at each endpoint
- **Location**: [backend/apps/accounts/api.py](backend/apps/accounts/api.py#L126-L135) (`accounts_me`), [backend/apps/accounts/api.py](backend/apps/accounts/api.py#L185-L204) (`list_members`)
- **Description**: `_me_out(user)` is correctly extracted for `me` routes,
  but `list_members` re-instantiates `MemberOut` inline per-user with the
  identical field mapping. If MemberOut gains a field, it must be updated
  in both places.
- **Severity**: low
- **Evidence**: `MemberOut(username=u.username, email=u.email, ...)` in the
  list comprehension duplicates the same mapping that `_me_out` does.
- **Recommendation**: introduce `_member_out(user)` mirroring `_me_out`,
  and have `list_members` call it.

### R2-3 — Startupdb founder/startup serializer field-mapping pairs
- **Location**: [backend/apps/startupdb/api.py](backend/apps/startupdb/api.py#L29-L60)
- **Description**: `_founder_out` and the founder portion of `_startup_out`
  build `FounderOut` field-by-field; the exercise is needed because of the
  Ninja FK-serialization gotcha (`created_by` FK→object is resolved).
  Still, the explicit mapping is duplicated across both helpers.
- **Severity**: low
- **Evidence**: `founders=[_founder_out(f) for f in entry.founders.all()]`
  re-enters the same function per element.
- **Recommendation**: acceptable as-is; simply keep both helpers in one
  place. No further extraction is warranted (avoid a generic serializer
  framework).

### R2-4 — Duplicate `useQuery` formulation for members in two modules
- **Location**: [frontend/src/shared/lib/auth/api.ts](frontend/src/shared/lib/auth/api.ts#L132-L137) (`useMembers`), [frontend/src/pages/member/widgets/MembersWidget.tsx](frontend/src/pages/member/widgets/MembersWidget.tsx#L14-L20)
- **Description**: `useMembers()` hook is exported from `api.ts` but the
  widget redefines the same `useQuery({ queryKey:['members'], queryFn: fetchMembers })`
  inline.
- **Severity**: low
- **Evidence**: duplication between hook library and widget code.
- **Recommendation**: use the exported `useMembers()` hook (one line) — the
  widget should consume the library it already owns.

### R2-5 — Header section re-wrapped through `HeaderActions`/`HeroActions`
- **Location**: [frontend/src/shared/ui/header/HeaderActions.tsx](frontend/src/shared/ui/header/HeaderActions.tsx), [frontend/src/shared/ui/header/HeroActions.tsx](frontend/src/shared/ui/header/HeroActions.tsx)
- **Description**: Re-wrapping `AuthSection` in two files is organisational
  duplication (same pattern as R1-2).
- **Severity**: low
- **Evidence**: both files do nothing except pass a different `size` prop.
- **Recommendation**: fold into `AuthSection` call sites and delete files.
