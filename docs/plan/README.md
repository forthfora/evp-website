# Refactoring Plan — Edinburgh VenturePoint Website

## Overview

Small, sequential refactors to address 47 review findings under
[docs/review/](docs/review/). The plan tackles configuration/versioning
first, then dead-code and dependency hygiene, then duplication extraction,
and closes with the highest-leverage test coverage.

The site must look and function identically before and after; every change
is behaviour-preserving.

## Phase Index

| Phase | Title                              | Risk  | Depends on |
|-------|------------------------------------|-------|------------|
| 1     | Config and version alignment       | low   | none       |
| 2     | Dead code and unused module cleanup| low   | 1          |
| 3     | Duplication extraction             | low   | 1, 2       |
| 4     | Targeted test coverage             | low   | 1, 2, 3    |

## Risk Summary

- Low risk: all four phases.
- Riskiest individual change: bumping Dockerfile to Python 3.13 (Phase 1) —
  mitigated by full test suite and a single-string substitution.
- The `helpers` module removal (Phase 2) is small but depends on the
  sys.path hack being safely removable; we verify no other imports rely on
  it before the removal.

## Dependency Graph

```
Phase 1 (config fixes)
   │
   ├─► Phase 2 (dead code & deps cleanup)
   │      │
   │      └─► Phase 3 (duplication extraction)
   │             │
   │             └─► Phase 4 (test coverage)
```

## Finding coverage

- Phase 1 resolves: R8-1, R8-2, R8-3, R8-6, R8-7, R5-3 (aligned with deps)
- Phase 2 resolves: R1-1, R3-1, R3-2, R3-4, R4-1
- Phase 3 resolves: R1-2, R2-1, R2-2, R2-4, R2-5, R3-6
- Phase 4 resolves: R5-1, R5-4, R5-5, R5-3 (closed if Phase 1 removes the
  declared pytest deps)

## Findings left for later review

- R1-3 router mount asymmetry — kept to avoid external behaviour change
- R1-4 header naming ambiguity — resolved structurally by R1-2
- R2-3 serializer duplication — accepted as required by Ninja FK gotcha
- R3-5, R4-2, R4-3 comment notes — low-grade noise, no action
- R6-1 to R6-5 style notes — no behaviour change warranted
- R7-* security flags — out of the refactoring plan by constraint
- R8-4 smtp setup note — partially covered under Phase 2 (SMTP removal)
