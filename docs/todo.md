# TODO — Fix CI/CD Pipeline

**Priority:** High — deployments on push to `main` are currently failing.

## Root Causes

1. **Missing Dockerfile (fatal error)**
   - The `build-and-push` job used `context: .` (repo root), but no `Dockerfile` exists at the root.
   - Error: `ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory`
   - Each service has its own Dockerfile at `frontend/Dockerfile` and `backend/Dockerfile`.

2. **Deprecated Node.js 20 actions (deprecation warnings)**
   - GitHub runners now default to Node 24; the workflow pinned actions running on Node 20:
     `actions/checkout@v4`, `docker/login-action@v3`, `docker/metadata-action@v5`, `docker/build-push-action@v5`.
   - See: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
   - Also produced `[DEP0040] punycode module is deprecated` warnings.

3. **Single monolithic image tag**
   - The workflow built one image (`evp-website:latest`) but `docker-compose.yml` expects two images:
     `ghcr.io/forthfora/evp-frontend:latest` and `ghcr.io/forthfora/evp-backend:latest`.
   - Deploy job's `docker compose pull` would never pick up newly built images.

## Fixes Applied (`.github/workflows/deploy.yml`)

- [x] Split `build-and-push` into a matrix job building `frontend` and `backend` separately with `context: ./${{ matrix.service }}`.
- [x] Tag images per-service: `ghcr.io/<owner>/evp-frontend:latest` and `ghcr.io/<owner>/evp-backend:latest` (matches `docker-compose.yml`).
- [x] Upgrade actions to Node 24-compatible versions:
  - `actions/checkout@v4` → `@v6`
  - `docker/login-action@v3` → `@v4`
  - `docker/metadata-action@v5` → `@v6`
  - `docker/build-push-action@v5` → `@v7`
  - `appleboy/ssh-action@v1.0.3` → `@v1.2.0`

## Verification Checklist

- [ ] Push to `main` and confirm the `build-and-push` matrix job completes for both `frontend` and `backend`.
- [ ] Confirm no Node 20 deprecation annotations appear in the run summary.
- [ ] Confirm both images appear in GHCR under the repo's packages (`evp-frontend`, `evp-backend`) tagged `latest`.
- [ ] Confirm the `deploy` job SSHes in, `docker compose pull` pulls new digests, and containers restart healthy.
- [ ] Verify the live site (https://edinburghventurepoint.com) and `/api/docs` respond after deploy.
- [ ] Verify server-side secrets are set: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `GHCR_DEPLOY_TOKEN`.

## Nice-to-haves (future)

- [ ] Add `docker/setup-buildx-action` + registry layer caching (`cache-from`/`cache-to: type=gha`) to speed up builds.
- [ ] Add per-commit SHA tags in addition to `latest` for rollback capability.
- [ ] Add a CI job running frontend lint/build and backend tests on PRs.
