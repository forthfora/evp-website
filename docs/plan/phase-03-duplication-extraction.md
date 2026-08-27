# Phase 3: Duplication extraction (frontend + backend)

- **Goal**: extract the duplicated Tailwind class constants, member-serializer
  reuse, and wrap-up header section simplification — behaviour unchanged
- **Depends on**: Phase 1, Phase 2
- **Risk level**: low
- **Files affected**:
  - `frontend/src/pages/member/widgets/SettingsWidget.tsx`
  - `frontend/src/pages/member/widgets/AdminUpdatesWidget.tsx`
  - `frontend/src/pages/auth/styles.ts` (or new shared module)
  - `backend/apps/accounts/api.py` (introduce `_member_out`)
  - `frontend/src/shared/ui/header/HeaderActions.tsx`
  - `frontend/src/shared/ui/header/HeroActions.tsx`
  - `frontend/src/shared/ui/header/AuthSection.tsx`
  - `frontend/src/pages/member/widgets/MembersWidget.tsx` (use `useMembers`)
- **Changes**:
  1. Extract the shared widget className constants (`inputClass`,
     `labelClass`, primary/ghost) from `SettingsWidget`,
     `AdminUpdatesWidget`, and the auth flow styles module into one
     `frontend/src/shared/styles/formClasses.ts` (or extend the existing
     `pages/auth/styles.ts`). Resolves R2-1.
  2. Add `_member_out(user)` in `backend/apps/accounts/api.py` and have
     `list_members` call it. Resolves R2-2.
  3. Delete `HeaderActions` and `HeroActions` wrapper components; inline
     `AuthSection size="large"` calls. Resolves R1-2/R2-5.
  4. In `MembersWidget`, replace inline `useQuery({queryKey:['members']})`
     with the exported `useMembers()` hook from `shared/lib/auth/api`.
     Resolves R2-4.
  5. Fix `grid-col-1` typo in `MemberDashboardPage.tsx`. Resolves R3-6.
- **Functionality preservation**: all are pure renaming/retargeting; DOM
  structure & routes remain identical. The MembersWidget query hook change
  is semantic-equivalent because it uses the same `queryKey` and
  `queryFn` — cache behaviour remains the same.
- **Verification**:
  - `uv run python manage.py test` passes
  - `npm run build`, `npm run lint`, `npm run format` all succeed
  - Frontend smoke: open the member dashboard on each page, view a members
    list, exercise the Settings widget email change, exercise the
    AdminUpdates send; verify header and hero auth sections look right
  - run `uv run ruff check` to ensure no unused imports remain
- **Rollback**: each extraction is independent; revert per commit. Do not
  mix R2-1 with widget-feature changes.
