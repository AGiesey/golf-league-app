## Context

Currently the Auth0 SDK redirects to `/` after a successful login (default behavior), and there is no routing logic for unauthenticated visits to `/` or authenticated visits to `/login`. The proxy.ts already handles unauthenticated access to `/me` → `/login` in mock mode, and delegates everything to the Auth0 middleware in auth0 mode.

## Goals / Non-Goals

**Goals:**
- Post-login redirect lands on `/me`
- Authenticated users visiting `/` or `/login` are sent to `/me`
- Unauthenticated users visiting `/` are sent to `/login`
- Works in both mock and auth0 modes

**Non-Goals:**
- Redirecting unauthenticated `/me` → `/login` (already implemented)
- Any changes to the API or DB
- `returnTo` preservation for deep links (out of scope for now)

## Decisions

**Post-login redirect via `returnTo`** — The Auth0 SDK reads a `returnTo` param from the login URL. Passing `returnTo=/me` when initiating login makes the callback redirect there automatically. This is cleaner than a separate post-callback redirect page.

**Proxy handles `/` and `/login` redirects** — The proxy.ts runs before any page renders, making it the right place for session-state-based redirects. Checking session state in the proxy avoids a flash of the wrong page. In auth0 mode the Auth0 middleware already reads the session from the cookie; we check `getSession()` before deciding where to send the user. In mock mode we check for the `app-token` cookie as before.

**Don't redirect `/` in mock mode for unauthenticated users** — In mock mode there is no real "unauthenticated landing page" — `/dev/login` serves that purpose. The `/` → `/login` → `/dev/login` chain already works via the login page redirect.

## Risks / Trade-offs

- [Session check in proxy adds latency] → `getSession()` reads the encrypted cookie — no network call, negligible cost
- [Authenticated redirect from `/login` could confuse a user who explicitly navigated there to switch accounts] → Acceptable for now; logout-first is the expected flow
