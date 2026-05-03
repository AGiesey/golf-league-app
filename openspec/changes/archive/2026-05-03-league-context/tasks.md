## 1. API — LeagueContext type and season resolution

- [x] 1.1 Add `LeagueContext` record to `api/Models/` with fields: `GolferId`, `LeagueMembershipId`, `SeasonId`, `LeagueId`, `CourseId`, `IsCommissioner`
- [x] 1.2 Implement `GET /api/context` endpoint in `api/Program.cs`: reads optional `membershipId` query param, resolves candidate memberships using active/recently-ended season logic, returns `resolved`, `pick_required`, or `no_leagues` response
- [x] 1.3 Strip membership list from `GET /me` endpoint — return profile only (id, firstName, lastName, email, course name)

## 2. Web — context utility and cookie handler

- [x] 2.1 Create `web/lib/leagueContext.ts` — typed wrapper around `GET /api/context` that passes the `active_membership_id` cookie value as `membershipId` and returns the typed response
- [x] 2.2 Create `web/app/api/context/select/route.ts` — POST Route Handler that validates the selected membership ID exists in the current candidate list, sets the `active_membership_id` cookie (HttpOnly, SameSite=Lax, Path=/), and redirects to `/dashboard`

## 3. Web — dashboard page

- [x] 3.1 Create `web/app/dashboard/page.tsx` — server component that calls the context utility, renders league name + season year + commissioner badge on resolved, redirects to `/pick-league` on pick_required (clearing stale cookie first), redirects to `/me` on no_leagues

## 4. Web — league picker page

- [x] 4.1 Create `web/app/pick-league/page.tsx` — server component that calls `GET /api/context` to get the candidate list; if single candidate redirects to `/dashboard`; otherwise renders a form listing each membership (league name, season year, commissioner flag)
- [x] 4.2 Wire the picker form to `POST /api/context/select` so selecting a membership sets the cookie and redirects to `/dashboard`

## 5. Routing and auth changes

- [x] 5.1 In `web/lib/auth0.ts` change `signInReturnToPath` from `/me` to `/dashboard`
- [x] 5.2 In `web/proxy.ts` add `/dashboard` and `/pick-league` to `PROTECTED_PATHS`; update authenticated `/` redirect from `/me` to `/dashboard`; update authenticated `/login` redirect from `/me` to `/dashboard`

## 6. Update /me page

- [x] 6.1 Remove the memberships card and membership list from `web/app/me/page.tsx`; update API call to match the stripped `/me` response shape (no memberships field)

## 7. Update living docs

- [x] 7.1 Update `docs/auth-and-league-context.md` to reflect that `/dashboard` is the post-login landing route

## 8. Verify

- [x] 8.1 Log in — confirm redirect lands on `/dashboard` showing league name, season year
- [x] 8.2 Confirm commissioner badge appears for the commissioner golfer and is absent for a regular member
- [x] 8.3 Log out, visit `/dashboard` directly — confirm redirect to `/login`
- [x] 8.4 Confirm `/me` shows profile without the memberships card
- [x] 8.5 (If testable) Simulate multiple memberships — confirm `/pick-league` renders the list and selecting one lands on `/dashboard` with correct context
