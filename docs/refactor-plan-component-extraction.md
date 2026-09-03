# Refactor Plan — Component Extraction & Tailwind Deduplication

**Status:** Draft (not yet implemented)
**Scope:** `frontend/src/app/routes/*`, `frontend/src/styles/*`, `frontend/src/components/ui/*`, `frontend/src/features/*`
**Goal:** Extract inline components from route pages into feature folders, eliminate `src/styles/`, and consolidate all repeated Tailwind class strings into `cva`-driven UI primitives — **with zero visual change**.

---

## 1. Current State (Audit Summary)

### Route pages (`src/app/routes/`)

| File | Lines | Inline components to extract | Target feature folder |
|---|---|---|---|
| `AboutPage.tsx` | 246 | `MemberYearSection`, `MemberCard`, hero block | `features/about/components/` (new) |
| `AuthPage.tsx` | 68 | — (already clean; use as the template) | — |
| `ContactPage.tsx` | ~380 | `OfferCardsSection`, `ContactHero`, `ContactFormSection` | `features/contact/` (new folder) |
| `ErrorPage.tsx` | 80 | — (small; only style fixes) | — |
| `EventsPage.tsx` | 280 | `AnimatedCounter`, `ReserveButton`, `EventCard` | `features/events/components/` (new) |
| `HomePage.tsx` | 189 | `AboutUsSection`, `WhatWeDoSection`, `EventsSection` | `features/homepage/components/` |
| `MemberDashboardPage.tsx` | 83 | — (lean; only shimmer-title dedup) | — |
| `StartupsPage.tsx` | 140 | hero block, "You?" CTA card | `features/startups/components/` |

### `src/styles/` — elimination is feasible

| File | Contents | Fate |
|---|---|---|
| `button-underline.css` (21 lines, raw CSS, imported by 11 files) | `.button-underline` underline-sweep | → `@utility button-underline` in `index.css`; delete all 11 imports. Also fixes `ScrollSpy.tsx`'s fragile transitive-CSS dependency. |
| `button-spin.css` (13 lines, raw CSS, 1 importer) | `@keyframes spin-in` + `.button-spin` | → `@keyframes` + `@utility button-spin` in `index.css` |
| `logo-build.css` (~40 lines, raw CSS, 1 importer) | `.logo-container`, `.logo-build`, `@keyframes buildLogo` | → `@utility` entries in `index.css` |
| `form-classes.ts` | `inputClass`, `labelClass`, `primaryBtnClass`, `ghostBtnClass` | → replaced by cva primitives (`Button`, `Input`, `Label`); delete file |

### Three sources of truth for the same class strings (must unify)

1. `src/styles/form-classes.ts` — `py-2.5 text-sm` sizing (member widgets)
2. `src/features/auth/styles.ts` — `py-3 text-base` sizing (auth flow)
3. `src/features/member/components/widgets/StartupDatabaseWidget.tsx` — **local redefinition** of the same four strings
4. Plus inline copies in `ContactPage.tsx` (inputs ×3, labels ×3, primary button) and `ConfirmDialog.tsx` (button classes)

### Already in place

- `cn()` (`clsx` + `tailwind-merge`) at `src/utils/cn.ts` — used by 11 components ✅
- `clsx`, `tailwind-merge` in `package.json` ✅
- `HeroSection` component exists in `components/ui/` but is **unused** — About/Contact/Startups heroes hand-roll identical markup ❌
- `index.css` already uses Tailwind 4 `@utility` (`glass-box`) and `@theme` tokens ✅
- `class-variance-authority` ❌ **not installed** — add it

---

## 2. Target Architecture

```
src/
├── index.css                     # tokens + @utility (glass-box, button-underline, button-spin, logo-*) + keyframes
├── utils/
│   ├── cn.ts                     # unchanged
│   └── motion.ts                 # extended with shared presets (fadeUp, slideIn, riseIn)
├── components/
│   └── ui/
│       ├── button.tsx            # cva: intent (primary/ghost/pill/link) × size (sm/md)
│       ├── input.tsx             # cva: size (sm/md) — replaces inputClass ×3 sources
│       ├── label.tsx             # cva: size (sm/md) — replaces labelClass
│       ├── chip.tsx              # cva: variant (accent/outline/subtle) — EventsPage pills
│       ├── glass-section.tsx     # cva: padding (md/lg) — full-width glass-box sections
│       ├── section-heading.tsx   # heading + SectionDivider (unifies w/ UnderlinedTitle via size/align)
│       ├── promo-card.tsx        # glass card + image + title + body (HomePage/ContactPage card rows)
│       ├── media-text-section.tsx# two-col image+text w/ slideIn, `reverse` prop
│       ├── text-link.tsx         # accent button-underline link, cva size
│       ├── blob-background.tsx   # animated blobs (StartupsPage CTA, InteractiveLinkButton)
│       ├── shimmer-title.tsx     # gradient shimmer title (MemberDashboardPage, WelcomeWidget)
│       ├── HeroSection.tsx       # existing — now actually used
│       ├── FormField.tsx         # existing — rewired to input.tsx/label.tsx
│       └── ... (unchanged existing)
└── features/
    ├── about/components/         # MemberYearSection, MemberCard
    ├── contact/                  # NEW folder: components/{ContactHero, OfferCardsSection, ContactFormSection}
    ├── events/components/        # EventCard, ReserveButton, AnimatedCounter
    ├── homepage/components/      # AboutUsSection, WhatWeDoSection, EventsSection (+ existing HomePageHero)
    ├── startups/components/      # YouCtaCard (+ existing StartupBlock, PartnersSection)
    ├── auth/styles.ts            # DELETED — stepVariants moves to hooks or steps/, classes to ui/
    └── member/...                # widgets rewired to ui primitives; local class copies deleted
```

**Placement rule:** components used by ≥2 features (or generic enough to be) go in `components/ui/`; single-feature components go in `features/<name>/components/`. Route files keep only: data assembly, `PageMeta`, and section composition.

---

## 3. Work Phases (dependency-ordered, each independently mergeable)

### Phase 0 — Foundations
1. `npm install class-variance-authority`
2. Migrate the three CSS files into `index.css` as `@utility button-underline`, `@utility button-spin`, `@utility logo-container` / `@utility logo-build` + their `@keyframes`. Verify Tailwind 4 `@utility` syntax handles the `::after` pseudo-element (it does) and the `.active` state (use `&.active` inside the utility or a `data-[active]` variant — pick whichever compiles; fallback is keeping a tiny plain-CSS block in `index.css`, which is acceptable per the playbook's "unavoidable globals" clause).
3. Delete all 11 `import '@/styles/button-underline.css'` etc. statements; confirm `ScrollSpy.tsx` still styled (now explicit).
4. Extend `utils/motion.ts` with the hand-rolled presets found in pages: `riseIn(delay)` for the `initial={{opacity:0,y:30}} whileInView ...` pattern (~20 sites).

**Checkpoint:** `npm run build`, `npm run lint`, `npm run test`, visual smoke of every page. No visual change expected.

### Phase 1 — UI primitives (cva)
Create in `components/ui/`, each with `cn()`-merged `className` passthrough:

- **`button.tsx`** — `buttonVariants`:
  - base: `cursor-pointer font-bold tracking-widest uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40`
  - `intent`: `primary` (`bg-accent hover:bg-accent/80 text-white rounded-lg`), `ghost` (`border-accent/30 hover:border-accent/60 border rounded-lg`), `pill` (the EventsPage `ReserveButton` rounded-full + shine-sweep — sweep becomes a child span), `link` (auth's `linkBtnClass`)
  - `size`: `sm` (`px-4 py-2 text-sm`), `md` (`px-6 py-3 text-base`)
  - Replaces: `primaryBtnClass` (×3 sources), `ghostBtnClass`, `linkBtnClass`, `PrimaryButton.tsx` (re-export as thin wrapper or migrate call sites and delete), `ConfirmDialog` inline classes, `ReserveButton`.
- **`input.tsx`** — `inputVariants` with `size: sm` (`py-2.5 text-sm`) / `md` (`py-3 text-base`); also `digit` variant for the OTP `digitInputClass`. Replaces all `inputClass` copies.
- **`label.tsx`** — `size: sm` (`text-xs`) / `md` (`text-sm`). Rewire `FormField` to use it.
- **`chip.tsx`** — EventsPage pill variants.
- **`glass-section.tsx`** — `padding: md` (`py-25 md:py-40`) / `lg` (`py-25 md:py-50`); base `glass-box w-full overflow-hidden`.
- **`section-heading.tsx`** — title + `SectionDivider width="w-75 md:w-100" my="my-2"` + motion preset; `size: md` (`text-4xl md:text-5xl`) / `lg` (`text-4xl md:text-6xl`). Evaluate merging with `UnderlinedTitle` (which centers and defaults `text-5xl md:text-7xl`) — likely keep `UnderlinedTitle` for hero titles, `SectionHeading` for in-page sections.
- **`text-link.tsx`** — `text-accent button-underline font-bold transition-opacity` with `size` variant; replaces 7 inline copies.
- **`promo-card.tsx`** — glass card + `h-100` image + title + body + optional link; serves HomePage `WhatWeDoSection` and ContactPage `OfferCardsSection`.
- **`media-text-section.tsx`** — `max-w-6xl flex flex-col md:flex-row` + `slideIn` + rounded image; `reverse` prop.
- **`blob-background.tsx`**, **`shimmer-title.tsx`** — small dedup extractions.

**Checkpoint:** primitives unit-tested where logic exists (variant merging), `npm run test` green. No call sites migrated yet.

### Phase 2 — Rewire existing consumers
1. `FormField.tsx`, `PrimaryButton.tsx` → use new primitives (keep exports stable).
2. Member widgets (`SettingsWidget`, `AdminUpdatesWidget`, `StartupDatabaseWidget`, `MembersWidget`) → replace `form-classes` imports and local copies with primitives.
3. Auth feature → replace `auth/styles.ts` class exports with primitives in `EmailStep`/`CodeStep`/`NamesStep`; move `stepVariants` into `features/auth/hooks/use-auth-flow.ts` or a `steps/variants.ts`; **delete `auth/styles.ts`**.
4. `ConfirmDialog`, `InteractiveLinkButton` → `Button`/`BlobBackground`.
5. **Delete `src/styles/` entirely.**

**Checkpoint:** `grep -r "styles/form-classes\|features/auth/styles\|@/styles"` returns nothing; full test/lint/build green; visual smoke.

### Phase 3 — Route page extraction (one page per commit)
Order by size/impact:

1. **ContactPage** (~380 → ~60 lines): create `features/contact/` with `ContactHero` (→ `HeroSection`), `OfferCardsSection` (→ `PromoCard` grid), `ContactFormSection` (→ `MediaTextSection` + `FormField` + `Button`). Route keeps form state/submission wiring only.
2. **EventsPage** (280 → ~80): `EventCard`, `ReserveButton` (→ `Button intent="pill"`), `AnimatedCounter` → `features/events/components/`; section headers → `SectionHeading`; empty states → small `EmptyState` (or `glass-box` + `cn`).
3. **AboutPage** (246 → ~80): `MemberYearSection`, `MemberCard` → `features/about/components/`; hero → `HeroSection`; links → `TextLink`; fix stray `;` typo at line 38.
4. **HomePage** (189 → ~70): `AboutUsSection` (→ `MediaTextSection`), `WhatWeDoSection` (→ `PromoCard` grid), `EventsSection` → `features/homepage/components/`.
5. **StartupsPage** (140 → ~60): hero → `HeroSection`; "You?" CTA → `features/startups/components/YouCtaCard.tsx` using `BlobBackground`.
6. **ErrorPage**: swap hardcoded `bg-gray-800`/`text-red-600` for theme tokens (`bg-background-muted`/`text-accent` or new tokens), fix `rounded-l` → `rounded-lg`, link → `TextLink`.
7. **MemberDashboardPage**: shimmer title → `ShimmerTitle` (also update `WelcomeWidget`).

**Checkpoint per page:** route file contains only composition + data; `npm run build && npm run lint && npm run test` green; side-by-side visual check.

### Phase 4 — Cleanup & guardrails
1. Delete dead code: `PrimaryButton.tsx` if fully superseded, `components/ui/contact/TODO.md` empty folder.
2. Update barrel exports (`components/ui/index.ts`, feature `index.ts` files).
3. Add a short "Styling conventions" section to `AGENTS.md`: new primitives via cva in `components/ui/`; no new CSS files; no `@apply`; use `cn()` for overrides; route files contain composition only.
4. Final full run: `npm run lint`, `npm run format`, `npm run test`, `npm run build`.

---

## 4. Visual-regression strategy

No visual change is the hard requirement. Mitigations:

1. **Class-string provenance:** every cva variant is seeded with the *exact* class string it replaces (copy-paste, then let `tailwind-merge` semantics handle overrides). Where two sources differ only in sizing (auth `py-3 text-base` vs member `py-2.5 text-sm`), that becomes an explicit `size` variant — call sites keep their current size.
2. **Per-phase checkpoints** (above) with manual smoke of `/`, `/about`, `/startups`, `/events`, `/contact`, `/join`, `/member` in both light and dark themes.
3. **Extraction = move, not rewrite:** Phase 3 moves JSX verbatim into new files first (only adding props), then swaps duplicated blocks for primitives in a second pass within the same commit — keeps diffs reviewable.
4. Existing Vitest suite (`npm run test`) must stay green; add render tests for new primitives where cheap.

---

## 5. Risks & notes

- **`@utility` with pseudo-elements/states** (Tailwind 4): `button-underline`'s `::after` and `.active` need verification in Phase 0; worst case they remain as plain CSS in `index.css` — still satisfies "eliminate `src/styles/`".
- **`HeroSection` prop drift:** the three hero usages differ slightly (min-height, content width). Extend via existing `minHeight`/`className` props rather than editing the component's defaults.
- **`ReserveButton` shine-sweep:** the pill variant needs the sweep overlay span baked into `Button` when `intent="pill"` (or keep `ReserveButton` as a thin feature-level wrapper around `Button`) — prefer the wrapper to avoid over-parameterizing the primitive.
- **Framer-motion props on primitives:** `SectionHeading`/`MediaTextSection` wrap `motion.div`; keep `animated?: boolean` escape hatches like `UnderlinedTitle` already does.
- **Scope discipline:** do not touch `components/three/`, `components/theme/`, backend, or API layers.

## 6. Estimated impact

- `src/styles/` deleted (4 files).
- ~15 new UI primitive/feature component files; 8 route files shrink from ~1,470 lines total to ~450.
- 4 sources of button/input/label class strings → 1 cva module each.
- 11 CSS import statements removed; `ScrollSpy` implicit-CSS fragility fixed.
