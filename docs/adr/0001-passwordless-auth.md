# ADR 0001: Passwordless Authentication via Email One-Time Codes

**Status:** Accepted
**Date:** 2026-07-28
**Deciders:** EVP Committee

## Context

EVP needs member accounts on the website. The backend already has a custom
email-based `User` model (`USERNAME_FIELD = "email"`, no first/last name) and
JWT token issuing via `jwtninja`. The site is served as a React SPA from the
same origin as the API via Nginx. Committee members currently manage content
via the Django admin only.

We want the lowest-friction sign-up possible for students: no password to
invent, forget, or leak. At the same time, we don't want to paint ourselves
into a corner — a password-based login might be wanted later (e.g. for
committee convenience or integrations).

## Decision

### 1. Passwordless OTP flow as the only login mechanism (for now)

A single unified flow with no separate "register" vs "login" endpoints:

1. `POST /api/auth/request-code` — accepts `{ email }`. Creates an `EmailOTP`
   record (6-digit numeric code, stored hashed), sends it via Resend. Always
   returns 202 whether or not the email already has an account (prevents
   user enumeration).
2. `POST /api/auth/verify-code` — accepts `{ email, code }`. Validates the
   code (unexpired, unconsumed, under max attempts). If the email has no
   `User` yet, creates one on the spot. Returns JWT access + refresh tokens
   via the existing `jwtninja` integration.

### 2. `User.password` stays a normal Django field, always set unusable

New users are created via `set_unusable_password()`. The `password` column
remains in the schema with no changes. This keeps the door open for a future
password-based login endpoint without any migration — just a new endpoint
(e.g. `POST /api/auth/login-password`) that requires the user to have set a
password first.

**Extension point:** when password auth is added later, add a
`POST /api/auth/login-password` endpoint that is disabled (403) for users
with unusable passwords, and an authenticated `POST /api/auth/set-password`
endpoint for users who want to opt in.

### 3. Token storage: access token in memory, refresh token in HttpOnly cookie

- **Access token** (15 min lifetime): returned in the JSON response body,
  held in React state (`AuthContext`) only — never `localStorage`. This
  avoids XSS token theft.
- **Refresh token** (7 day lifetime): set by the backend as an
  `HttpOnly`, `Secure`, `SameSite=Lax` cookie on the verify-code response.
  The browser sends it automatically on refresh requests; JavaScript cannot
  read it. On page load, the frontend attempts a silent refresh using the
  cookie, then calls `GET /api/accounts/me` to hydrate session state.

This is safe because frontend and API share an origin via Nginx (no
cross-origin cookie complications), and requires
`CORS_ALLOW_CREDENTIALS = True` with a non-wildcard allowed origin.

## Consequences

### Positive

- Zero-friction sign-up: type email, receive code, done.
- No password database to breach (all passwords unusable).
- No user enumeration via the request-code endpoint.
- Future password auth needs no schema change.

### Negative / accepted risks

- Login depends on email deliverability (Resend). Accepted: Resend is
  already used for the contact form.
- 6-digit codes are brute-forceable in theory; mitigated by max-attempts
  lockout (5 attempts) and per-email request cooldown (60s).
- Refresh cookie requires correct CORS/cookie config; a misconfiguration
  breaks silent refresh (caught by T16.4 verification).

## Alternatives considered

- **Django's built-in session auth**: rejected — the SPA is stateless and
  JWTs already work via `jwtninja`.
- **Magic links instead of codes**: rejected for now — codes work better on
  mobile (no context switch) and are simpler to implement. Magic links can
  be added later as an alternative verify mechanism without changing the
  OTP model significantly.
- **`localStorage` for refresh token**: rejected — vulnerable to XSS theft.
