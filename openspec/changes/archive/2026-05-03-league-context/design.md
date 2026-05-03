## Context

`GolferContextMiddleware` already resolves the `Golfer` on every API request and stores it in `HttpContext.Items["Golfer"]`. The `/me` endpoint queries `LeagueMembership` records inline but lacks date-based season filtering and the multi-case selection logic. The web `getAccessToken()` utility calls the API; no concept of league context exists on the web side yet.

Current routing: post-login → `/me`. Protected paths: `["/me"]`.

## Goals / Non-Goals

**Goals:**
- `GET /api/context` resolves and returns a `LeagueContext` (or a picker list) given an optional `membershipId` hint
- `/dashboard` renders the resolved context or redirects to `/pick-league` / `/me`
- `/pick-league` lets a multi-league user choose, writes the cookie, redirects to `/dashboard`
- Cookie `active_membership_id` persists the choice; server re-validates on every request
- Season resolution follows the doc rule: active season by date, or most recently ended as fallback

**Non-Goals:**
- Changing `/me` content (stays as profile/no-context area)
- Mid-session "switch league" affordance (doc defers this; picker is reachable later)
- Cross-course golfer records (doc defers multi-course identity; MVP golfers are single-course)
- Dashboard content beyond league name, season year, and commissioner badge

## Decisions

**`GET /api/context?membershipId={id}` on the API** — Putting resolution in the API keeps authorization server-side and re-validates the hint against DB state on every call. Alternative: resolve in the Next.js server layer — rejected because it would duplicate DB logic across two services and move authorization concerns into the front-end.

**Response shape has two states** — The endpoint returns either `{ status: "resolved", context: {...} }` or `{ status: "pick_required", memberships: [{id, leagueName, seasonYear, isCommissioner}] }`. The `no_leagues` case returns HTTP 200 with `{ status: "no_leagues" }` rather than an error code, since having no leagues is a valid business state. Alternative: separate endpoints for resolution vs. picker list — rejected as unnecessary round-trips.

**Cookie written by a Next.js Route Handler (`POST /api/context/select`)** — The browser cannot write `HttpOnly` cookies from a client component. A Route Handler receives the selected membership ID, validates it is in the candidate list (from a fresh call to `/api/context`), sets the cookie, and redirects to `/dashboard`. The `.NET API` never writes cookies — it only reads the hint via the `membershipId` query param. Alternative: have the API set a `Set-Cookie` header — rejected because the cookie domain is the Next.js origin, not the API origin.

**Dashboard redirects, not middleware** — Context resolution is an async DB call. Doing it in `proxy.ts` middleware would block every request, including static assets. Instead, the `/dashboard` server component calls `/api/context` on render and does a server-side redirect if needed. Alternative: dedicated `/auth/resolve` redirect page — adds a visible URL hop; the dashboard component redirect is invisible.

**Season resolution query** — `start_date ≤ today ≤ end_date` for active; if none, pick the season with the latest `end_date` where `end_date < today` and `archived_at IS NULL`. This is a single query with a `CASE`/`ORDER BY` rather than two sequential queries.

**`/me` page unchanged** — `/me` serves as the graceful landing for users with no context. What it shows when a golfer has no leagues is a UX decision deferred to a future proposal. For now it continues to show profile + membership list.

## Risks / Trade-offs

- [Clock skew between app server and DB server for "today" check] → Use `DateOnly.FromDateTime(DateTime.UtcNow)` consistently in the API; course timezone display is a separate concern
- [Stale `active_membership_id` cookie after season archives mid-session] → `/api/context` re-validates on every call; invalid hint returns `pick_required` or `no_leagues`, Next.js clears the cookie and redirects
- [Dashboard redirect loop if context endpoint always returns pick_required] → Picker page writes the cookie before redirecting; `/dashboard` should never redirect to picker if the cookie was just set

## Open Questions

- None blocking implementation. The multi-course identity edge case (one ExternalAuthId, multiple Golfer records at different courses) is deferred per the doc.
