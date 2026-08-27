# Review — Edinburgh VenturePoint Website

Index of findings across the 8 review dimensions in [docs/review/](docs/review/).

## Summary by dimension

| Dimension | High | Medium | Low | Total |
|-----------|-----:|-------:|----:|------:|
| 1. Architecture | 0 | 1 (R1-1) | 4 | 5 |
| 2. Duplication | 0 | 0 | 5 | 5 |
| 3. Code quality | 0 | 2 (R3-1, R3-2) | 5 | 7 |
| 4. Documentation | 0 | 0 | 5 | 5 |
| 5. Tests | 0 | 4 (R5-1, R5-2, R5-4, R5-5) | 1 | 5 |
| 6. Style | 0 | 0 | 5 | 5 |
| 7. Security | 0 | 2 (R7-1, R7-7) | 5 | 7 |
| 8. Dependencies | 1 (R8-1) | 5 (R8-2, R8-3, R8-4, R8-5, R8-7) | 1 | 8 |

**Total findings: 47** (4 medium-or-higher actionable in plan; rest are low-grade notes or flagged-only).

Most important findings:

- **Python version mismatch (R8-1)** — Dockerfile on 3.12, `pyproject >= 3.13`
- **Unused dependencies (R8-2)** — PyJWT, django-redis
- **CSRF port mismatch (R8-3)** — trusted origins use 16016 vs 16017
- **Dead media & SMTP settings (R8-4, R8-7)** — BLOCKED pattern for MEDIA
- **Test runner mismatch (R8-5)** — pytest deps declared, Django runner used
- **helpers module sys.path hack (R1-1, R3-2)** — dead `helpers.exceptions`

## Documents

- [architecture.md](architecture.md)
- [duplication.md](duplication.md)
- [code-quality.md](code-quality.md)
- [documentation.md](documentation.md)
- [tests.md](tests.md)
- [style.md](style.md)
- [security.md](security.md)
- [dependencies.md](dependencies.md)
