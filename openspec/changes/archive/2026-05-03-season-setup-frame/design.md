## Context

The app has a commissioner role (via `LeagueContext.isCommissioner`) but no commissioner UI yet. Season setup is the first commissioner-facing surface. The setup page and dashboard widget are read-only consumers of a single computed status object — their correctness depends entirely on the status computation being accurate and cheap.

The league context (`seasonId`, `isCommissioner`) is already resolved per-request by the `(app)` layout. All commissioner-facing API endpoints receive this context via the existing `GolferContextMiddleware` and the bearer token — no new auth infrastructure is required; only a new authorization check.

## Goals / Non-Goals

**Goals:**
- Establish the `/commissioner/*` route group and its authorization pattern (API + web) for all future commissioner proposals to build on
- Expose `GET /commissioner/season/setup-status` returning a live-computed `SeasonSetupStatus`
- Build the `/commissioner/season` tabbed shell with status banner; tab bodies are empty
- Render a setup-incomplete widget on the dashboard for commissioners when status is incomplete
- Add "Season" to the sidebar for commissioners

**Non-Goals:**
- Implementing roster management, team formation, or schedule generation (separate proposals)
- Persisting any setup state flag
- Email or notification on setup completion (separate proposal)
- Any UI for non-commissioner golfers beyond the existing "league isn't ready yet" placeholder on the dashboard

## Decisions

### Status computed at request time, never stored

`SeasonSetupStatus` is assembled in a service called on every request to the status endpoint. The three requirement checks are cheap EF Core `Any()` / `Count()` queries:

- **Roster**: `LeagueMembership.Count(m => m.SeasonId == seasonId && m.ArchivedAt == null) >= 2`
- **Teams**: `!LeagueMembership.Any(m => m.SeasonId == seasonId && m.ArchivedAt == null && !m.TeamMemberships.Any())`
- **Schedule**: `Week.Any(w => w.SeasonId == seasonId)`

All three can be batched into a single round-trip. No stored flag, no drift.

### `/commissioner/*` API route group with commissioner policy

A new route group in `Program.cs` registers `RequireAuthorization("Commissioner")`. The `Commissioner` policy reads `isCommissioner` from the golfer context (already attached by `GolferContextMiddleware`) and returns 403 if false. All future commissioner endpoints join this group — they need no inline role checks.

### Dashboard status fetch is a second call, accepted duplication

The dashboard page already calls `resolveLeagueContext()`. When the viewer is a commissioner, it makes a second call to `GET /commissioner/season/setup-status`. This is a deliberate duplication accepted for now — the two concerns (identity/context vs. setup status) are separate, and the status call is only made when `isCommissioner: true`. A React `cache()` layer or combined endpoint can collapse them later.

### Tab routing via URL search params, not nested routes

`/commissioner/season?tab=roster` keeps the page as a single server component root with a client tab switcher. This avoids nested routing complexity for what are currently empty placeholder tabs and makes deep-linking to a specific tab trivial.

Alternative considered: nested routes (`/commissioner/season/roster`). Rejected for now — the tab bodies are placeholders and nesting adds filesystem structure without benefit yet. The URL param approach is easy to migrate to nested routes when a tab gets real content.

### Completion indicators use icons from the design system

Each tab label renders a checkmark icon when `isMet: true` and a warning icon when `isMet: false`. Icons come from the existing design system token set — no new dependencies.

## Risks / Trade-offs

- **Double fetch on dashboard for commissioners** — adds one extra DB round-trip per dashboard render when the viewer is a commissioner. Acceptable at MVP given the number of users. → Mitigation: cache or combined endpoint in a future performance proposal.
- **Empty tab bodies** — `/commissioner/season` renders meaningful chrome (status banner, tab indicators) but no actionable content until roster/teams/schedule proposals land. Commissioners land here and see the checklist but cannot act on it yet. → Mitigation: each unimplemented tab shows a clear "coming soon" placeholder so the intent is obvious.
- **`/commissioner/*` protection pattern established here** — future commissioner proposals inherit this pattern. If the pattern changes (e.g., course admin role splits some actions), every endpoint in the group is affected. → Mitigation: the authorization doc describes the intended boundary; this design follows it exactly.
