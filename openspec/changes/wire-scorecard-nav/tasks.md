## 1. API — Update my-matchup-summary to include matchupId

- [x] 1.1 In `api/Program.cs`, update both `upcomingRaw` and `previousRaw` Select projections in `GET /season/my-matchup-summary` to include `id = m.Id` (the matchup Guid)
- [x] 1.2 Update the `upcoming` and `previous` anonymous object construction to include `matchupId = upcomingRaw.id` / `matchupId = previousRaw.id`
- [x] 1.3 Replace the `hasResults = false` TODO on `previous` with a real Round-existence check: project `hasResults = m.Pairings.Any(p => p.PairingSlots.Any(s => s.Round != null))` in the EF query

## 2. API — GET /api/me/upcoming-matchups

- [x] 2.1 Add `GET /me/upcoming-matchups` endpoint in `api/Program.cs` outside the commissioner group; authenticate via `RequireGolfer()` + `X-Membership-Id` header
- [x] 2.2 Query: find the earliest `Week` in the active season where `StartDate >= today`; return empty list with `reason: "no_upcoming_week"` if none
- [x] 2.3 Query: find matchups for that week where `TeamAId == teamId || TeamBId == teamId`; return empty list with `reason: "no_matchup_this_week"` if none
- [x] 2.4 Project each matchup to DTO: `{ matchupId, week: { number, startDate, nine }, myTeam: { name }, opponentTeam: { name }, pairings: [{ teeTime, slots: [{ slotId, playerName, hasRound }] }] }` — `hasRound` is `slot.Round != null`
- [x] 2.5 Return `{ matchups: [...] }` on success; include `reason` field only when `matchups` is empty

## 3. API — Commissioner score-entry endpoints

- [x] 3.1 Add `GET /commissioner/seasons/{seasonId}/score-entry/weeks` in `api/Program.cs` inside the commissioner group; validate that `seasonId` belongs to the caller's league
- [x] 3.2 Query: select all Weeks for the season, ordered by `StartDate DESC`; for each week project `{ weekId, weekNumber, startDate, type, nine, matchupCount, slotCount, roundCount }` using EF Count projections — do not load entities into memory
- [x] 3.3 Add `GET /commissioner/weeks/{weekId}/score-entry` in `api/Program.cs` inside the commissioner group; return 404 if weekId not in caller's season, 403 if week belongs to a different season
- [x] 3.4 Query: select all Matchups for the week, project `{ matchupId, teamA: { name }, teamB: { name }, pairings: [{ teeTime, slots: [{ playerName }] }], slotCount, roundCount }`

## 4. Frontend — MatchupWidget links

- [x] 4.1 Update the `MatchupSummary`, `UpcomingMatchup`, and `PreviousMatchup` TypeScript interfaces in `web/app/(app)/dashboard/widgets/MatchupWidget.tsx` to include `matchupId: string | null`
- [x] 4.2 Wrap the upcoming section content in `MatchupWidget` with `<Link href={/matchups/${upcoming.matchupId}}>` when `matchupId` is non-null; use the card-as-link pattern (full card clickable)
- [x] 4.3 Wrap the previous section content similarly with a link to its scorecard when `matchupId` is non-null

## 5. Frontend — UpcomingMatchupWidget (new)

- [x] 5.1 Create `web/app/(app)/dashboard/widgets/UpcomingMatchupWidget.tsx` — server component; accept props `membershipId: string, token: string`; fetch `GET /api/me/upcoming-matchups` with `apiFetchAuthenticated`
- [x] 5.2 Implement one-matchup state: single `Card` showing week label (e.g. "Week 4 · Jun 11"), nine (e.g. "Front 9"), opponent team name; entire card wrapped in `<Link href={/matchups/${matchupId}}>`
- [x] 5.3 Implement multiple-matchup state: map over matchups, render one card per matchup using the same card template
- [x] 5.4 Implement empty state: show "No upcoming matchup" with reason text from API response
- [x] 5.5 Add `UpcomingMatchupWidget` to `web/app/(app)/dashboard/page.tsx` — render it when setup is complete (both commissioner and golfer paths), above or alongside the existing `MatchupWidget`

## 6. Frontend — Sidebar nav update

- [x] 6.1 In `web/components/layout/Sidebar.tsx`, add `{ label: "Manage Scores", href: "/commissioner/scores" }` to the `COMMISSIONER_ITEMS` array (after "Manage Matchups")
- [x] 6.2 Remove `{ label: "Scores / Rounds", disabled: true }` from `MEMBER_ITEMS`

## 7. Frontend — Commissioner week list page

- [x] 7.1 Create `web/app/(app)/commissioner/scores/page.tsx` — server component; resolve league context, redirect non-commissioner to `/dashboard`; fetch `GET /commissioner/seasons/{seasonId}/score-entry/weeks` via `apiFetchAuthenticated`
- [x] 7.2 Render a list of week rows: week number, formatted date, `WeekType` badge, nine badge, status pill (`roundCount === 0 && slotCount > 0` → "Not started"; `0 < roundCount < slotCount` → "Partial"; `roundCount === slotCount && slotCount > 0` → "Complete"; `slotCount === 0` → "No matchups")
- [x] 7.3 Make each row a `<Link href={/commissioner/scores/${weekId}}>` — use the clickable-row pattern (full row width, hover state)
- [x] 7.4 Visually emphasize the first row (most recent / current week) — e.g. bold week number or subtle highlight — document the choice with an inline comment

## 8. Frontend — Commissioner week detail page

- [x] 8.1 Create `web/app/(app)/commissioner/scores/[weekId]/page.tsx` — server component; same auth guard as week list; fetch `GET /commissioner/weeks/{weekId}/score-entry` via `apiFetchAuthenticated`
- [x] 8.2 Render page header: "Week N · [date] · [type] · [nine]"
- [x] 8.3 Render a list of matchup rows: team A vs. team B, golfer names per pairing, status pill (same logic as week list), entire row wrapped in `<Link href={/matchups/${matchupId}?from=${weekId}}>`
- [x] 8.4 Render empty state when `matchups` array is empty

## 9. Frontend — Scorecard back-link

- [x] 9.1 Update `web/app/(app)/matchups/[matchupId]/page.tsx` to read the `from` search param (`searchParams.from`); if present and non-empty, pass `backWeekId={from}` to `ScorecardView`
- [x] 9.2 Add optional `backWeekId?: string` prop to `ScorecardView`; when present, render a `<Link href={/commissioner/scores/${backWeekId}}>← Back to week</Link>` in the page header area above the scorecard table

## 10. Design route examples

- [x] 10.1 Add `UpcomingMatchupWidget` static examples to `/design` — three states using dummy data: one matchup, multiple matchups, empty (wrap in a client component if needed to display static Cards without fetching)
- [x] 10.2 Add commissioner week list examples to `/design` — three states: all "Not started", mixed statuses, all "Complete"; use a static `WeekListExamples` client component with dummy data shaped like the DTO
- [x] 10.3 Add commissioner week detail examples to `/design` — three states: not started, partial, complete; use a static `WeekDetailExamples` client component

## 11. Cross-cutting

- [x] 11.1 Verify Docker build: `docker compose build api` passes with no errors
- [x] 11.2 Verify Docker build: `docker compose up -d --build web` passes with no TypeScript errors
- [ ] 11.3 Smoke-test golfer flow: log in as golfer → dashboard shows Upcoming Matchup widget → click card → scorecard loads
- [ ] 11.4 Smoke-test commissioner flow: log in as commissioner → sidebar shows "Manage Scores" → click → week list loads → click week → week detail → click matchup → scorecard loads with "Back to week" link → click back → returns to week detail
