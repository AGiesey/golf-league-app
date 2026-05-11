## Context

The `add-scorecard` change landed the scorecard route (`/matchups/[matchupId]`) and score entry dialog, but nothing in the app links to it. Two entry points are needed: a golfer-facing dashboard widget and a commissioner score-entry hub.

**Current state relevant to decisions:**
- `GET /season/my-matchup-summary` already exists and powers the `MatchupWidget` (upcoming + previous matchup). Its DTO does not include `matchupId`, so cards cannot link to the scorecard today.
- `MatchupWidget` lives in `web/app/(app)/dashboard/widgets/MatchupWidget.tsx` — a co-located server component.
- The sidebar `COMMISSIONER_ITEMS` array is in `web/components/layout/Sidebar.tsx`. Adding a nav item is a one-line array push.
- `ManageScores` commissioner capability was added by `add-scorecard` and already gates the scorecard write endpoints.

## Goals / Non-Goals

**Goals:**
- Make the scorecard reachable from the golfer dashboard (update existing My Matchups widget + add richer Upcoming widget).
- Give commissioners a week-list → week-detail → scorecard navigation flow.
- Add "Manage Scores" sidebar item for commissioners.
- Add "Back to week" link on the scorecard when arriving from the commissioner hub.

**Non-Goals:**
- Changing how matchups are created.
- Score entry from the week list or week detail pages.
- Filtering, search, or sorting across weeks.
- "Week complete" state or bulk actions.

## Decisions

### D1: Update existing `/season/my-matchup-summary` endpoint to include `matchupId`

The existing `MatchupWidget` shows upcoming and previous matchups but can't link to scorecards without `matchupId`. Rather than calling a second endpoint just for the id, add `matchupId: Guid?` to both the `upcoming` and `previous` DTO objects in the existing endpoint. This is a non-breaking addition (new nullable field).

**Alternative considered:** Leave the existing endpoint untouched and have the MatchupWidget fetch `matchupId` separately. Rejected — extra fetch for data that belongs in the same query.

### D2: New `GET /api/me/upcoming-matchups` endpoint for the richer upcoming widget

The existing matchup summary endpoint is shallow (team names, week number). The new "Upcoming Matchup" widget needs tee time and round-status-per-slot. Add a separate endpoint rather than bloating the summary DTO.

The new endpoint returns matchups in the golfer's *next upcoming week* (next week whose `start_date >= today`, or today's week if `start_date = today`). Each entry: `{ matchupId, week: { number, startDate, nine }, myTeam, opponentTeam, pairings: [{ teeTime, slots: [{ slotId, playerName, hasRound }] }] }`.

**"Next upcoming week" definition:** The earliest `Week` in the active season where `start_date >= today`. If today is a play date (`start_date == today`), that week is returned. This matches the prompt's stated assumption.

### D3: Commissioner endpoint path mirrors `/commissioner/scores` page path

The two commissioner API endpoints live under `/api/commissioner/seasons/{seasonId}/score-entry/weeks` and `/api/commissioner/weeks/{weekId}/score-entry`. The pages live at `/commissioner/scores` and `/commissioner/scores/[weekId]`. The naming asymmetry (seasons vs. weeks in path) is intentional: the week-detail endpoint is keyed by `weekId` directly since the season is derivable from the week.

### D4: "Back to week" via query param, not referrer

Referrer is unreliable (stripped by some browsers, absent on hard refresh). When the commissioner navigates from `/commissioner/scores/[weekId]` → `/matchups/[matchupId]`, append `?from=weekId` to the link. The scorecard page reads this param server-side and renders a "← Week N" back link if present. No state, no cookie, survives reload.

### D5: Existing `MatchupWidget` updated in-place; new `UpcomingMatchupWidget` co-located in same widgets dir

The dashboard page already imports from `./widgets/`. Co-locate new widgets there (`UpcomingMatchupWidget.tsx`). No new `web/components/dashboard/` directory needed — the existing pattern is `widgets/` inside the dashboard route segment.

### D6: Aggregate counts computed in SQL, not application code

The week-list and week-detail endpoints compute `slotCount` and `roundCount` via EF Core GroupBy / Count projections — not by loading all rows into memory. Status (`NotStarted` / `Partial` / `Complete`) is derived in the frontend from the counts.

## Risks / Trade-offs

- **`matchupId` added to existing DTO** — any client consuming `GET /season/my-matchup-summary` gets a new nullable field. No existing client breaks; all consumers are owned Next.js server components.
- **"Next upcoming week" edge case: no upcoming week** — season is over or no weeks scheduled. The endpoint returns an empty list with `reason: "no_upcoming_week"`. The widget shows an empty state.
- **`?from=weekId` query param back-link** — works correctly only when the user arrives from the week detail page. Direct navigation (URL bar, bookmark) shows no back link, which is correct behavior.
- **Week-list performance** — a season has ~20 weeks; each week has ~4 matchups and ~8 slots. Aggregate counts are trivial queries. No pagination needed.
