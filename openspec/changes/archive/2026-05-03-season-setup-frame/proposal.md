## Why

Before a season can be played, a commissioner must complete three setup steps — assembling the roster, forming teams, and scheduling weeks. Without a structured setup surface, that work has nowhere to live and the dashboard has no way to reflect an incomplete season. This proposal builds the structural shell: the status API, the commissioner setup page (tabs only, no implementations yet), the status-aware dashboard behavior, and the sidebar nav entry point.

## What Changes

- **New API endpoint** `GET /commissioner/season/setup-status` — returns a `SeasonSetupStatus` object computed live from the database: `isComplete` plus three named requirements (Roster, Teams, Schedule), each with `isMet` and a human-readable `detail` string. Protected: commissioner of the active league only.
- **New page** `/commissioner/season` — tabbed layout with three tabs (Roster, Teams, Schedule). Each tab label carries a completion indicator (checkmark or warning icon derived from the corresponding requirement). Tab bodies are empty placeholders. A status banner above the tabs shows overall setup state: success when `isComplete`, otherwise a checklist of unmet requirements with their `detail` strings.
- **Modified sidebar** — adds a "Season" nav item linking to `/commissioner/season`, visible only when `isCommissioner: true`.
- **Modified dashboard** — when `isComplete: false` and the viewer is a commissioner, the dashboard renders a setup-incomplete widget (checklist of failing requirements with links to the relevant tab on `/commissioner/season`) instead of normal content. When `isComplete: true`, the dashboard renders normally. Non-commissioner members see a "league isn't ready yet" placeholder regardless of the setup widget.

## Capabilities

### New Capabilities

- `season-setup-status` — the `GET /commissioner/season/setup-status` endpoint, the `SeasonSetupStatus` type, and the computation rules for each requirement
- `commissioner-season-page` — the `/commissioner/season` tabbed page with status banner and per-tab completion indicators

### Modified Capabilities

- `sidebar-nav` — add "Season" nav item (commissioner-only) linking to `/commissioner/season`
- `dashboard` — dashboard renders differently based on `SeasonSetupStatus.isComplete` and the viewer's role; commissioner sees setup widget when setup is incomplete; regular golfer sees a "not ready yet" placeholder

## Impact

- **API** — new route group `/commissioner/*` with commissioner authorization policy; new `SeasonSetupStatus` response type; EF Core queries against `LeagueMembership`, `TeamMembership`, and `Week` to compute status
- **Web** — new `/commissioner/season` page; `(app)/layout.tsx` already resolves `isCommissioner`; dashboard page gains a status fetch and conditional rendering path; sidebar gains a conditional nav item
- **Authorization** — establishes the `/commissioner/*` route protection pattern used by all future commissioner endpoints; no schema changes needed
- **No data model changes** — status is computed from existing entities; no new columns or migrations
