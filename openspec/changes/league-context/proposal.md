## Why

Auth and golfer resolution (Steps 1–2 of the flow in `docs/auth-and-league-context.md`) are done. Without Steps 3–6 — membership resolution, context selection, and the dashboard — the app has no concept of "which league the user is in right now," which is the implicit scope every subsequent feature depends on.

## What Changes

- **API**: New `LeagueContext` record type. New `GET /api/context` endpoint that resolves the active membership from an optional hint, builds the context, and returns it. Season date logic: active season (`start_date ≤ today ≤ end_date`) or most recently ended as fallback.
- **API**: `GET /me` endpoint stripped to profile-only (name, course). Membership list moves to context resolution.
- **Web**: New `/dashboard` page — server component that reads the `active_membership_id` cookie, calls `/api/context`, and renders league name/season/commissioner badge or redirects to `/pick-league` or `/me`.
- **Web**: New `/pick-league` page — renders a list of candidate memberships, user selects one, cookie is set, redirects to `/dashboard`.
- **Web**: Cookie utility (`active_membership_id`) — read in server components, written via a Route Handler.
- **Routing**: Post-login redirect changes from `/me` to `/dashboard`. Authenticated `/` redirects to `/dashboard`. `/dashboard` added as a protected path in the proxy.
- **`/me`**: Stays as a profile/no-context holding area. Its content does not change in this proposal.

## Capabilities

### New Capabilities

- `league-context-resolution`: API-side context resolution — LeagueContext type, `/api/context` endpoint, season date logic, membership validation
- `dashboard`: The `/dashboard` route — context-driven landing page for authenticated golfers with a resolved league
- `league-picker`: The `/pick-league` route — membership selection UI and cookie-writing handler

### Modified Capabilities

- `auth-routing`: Post-login now redirects to `/dashboard` instead of `/me`. Authenticated `/` redirects to `/dashboard`. `/dashboard` is a protected path.
- `golfer-auth`: `GET /me` endpoint now returns profile only (no membership list). "My profile page" requirement updated to reflect /me as the no-context holding area.

## Impact

- `api/Program.cs` — new `/api/context` endpoint, stripped `/me` endpoint
- `api/Models/` — new `LeagueContext` record
- `web/app/dashboard/page.tsx` — new file
- `web/app/pick-league/page.tsx` — new file
- `web/app/api/context/select/route.ts` — new cookie-writing Route Handler
- `web/lib/leagueContext.ts` — new utility for calling `/api/context`
- `web/lib/auth0.ts` — `signInReturnToPath` changes from `/me` to `/dashboard`
- `web/proxy.ts` — `/dashboard` added to `PROTECTED_PATHS`; authenticated `/` redirects to `/dashboard`
- `docs/auth-and-league-context.md` — must be updated as part of this change (per the doc's own instructions)
