## 1. API — Roster endpoints

- [x] 1.1 Add `GET /commissioner/season/roster` to the commissioner route group in `api/Program.cs`: query active `LeagueMembership` records for the active season joined with `Golfer`, ordered by `LastName` then `FirstName`, return array of `{ leagueMembershipId, golferId, firstName, lastName, email, handicap, isCommissioner }`
- [x] 1.2 Add `PATCH /commissioner/season/roster/{leagueMembershipId}/handicap` to the commissioner route group: accept `{ handicap: decimal? }`, validate the target membership belongs to the same season as the commissioner's active membership, update `LeagueMembership.Handicap`, return the updated membership object; return 404 if not found or archived, 403 if season mismatch

## 2. Web — RosterTable component

- [x] 2.1 Create `web/app/(app)/commissioner/season/RosterTable.tsx` as a `"use client"` component: accepts `membershipId: string` and `token: string` as props, fetches `GET /commissioner/season/roster` on mount with `X-Membership-Id` and `Authorization` headers, renders a table with columns: Name (+ commissioner badge if `isCommissioner`), Email, Handicap
- [x] 2.2 Implement the Handicap cell: if `handicap` is null render an `<input type="number">` that fires `PATCH /commissioner/season/roster/{id}/handicap` on blur or Enter; show a loading state (disabled input) during the request; on success switch the cell to plain text; on error revert input and show a toast
- [x] 2.3 Implement the Handicap cell: if `handicap` is non-null render the value as plain text (no edit affordance in this proposal)

## 3. Web — Wire RosterTable into SeasonTabs

- [x] 3.1 Update `web/app/(app)/commissioner/season/SeasonTabs.tsx`: replace the Roster tab placeholder content with `<RosterTable membershipId={...} token={...} />`; pass `membershipId` and `token` as props into `SeasonTabs` from the server component in `page.tsx`
- [x] 3.2 Update `web/app/(app)/commissioner/season/page.tsx` to pass `leagueMembershipId` and the access token as props to `SeasonTabs` so `RosterTable` can use them for authenticated API calls

## 4. Verify

- [x] 4.1 As commissioner, navigate to `/commissioner/season?tab=roster` — confirm the roster table renders with all active members sorted by last name
- [x] 4.2 Confirm each member row shows first name, last name, email, and a commissioner badge where applicable
- [x] 4.3 Confirm members with null handicap show an inline input; type a value, press Enter, and confirm the cell switches to plain text showing the saved value
- [x] 4.4 Confirm members with a set handicap show it as plain text with no input field
- [x] 4.5 Confirm `GET /commissioner/season/roster` returns 403 when called with a non-commissioner token
- [x] 4.6 Confirm `PATCH /commissioner/season/roster/{id}/handicap` returns 403 when called with a non-commissioner token
- [x] 4.7 Confirm the Teams and Schedule tabs still show their placeholder content (no regression)
