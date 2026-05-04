## Context

The `season-setup-frame` change established the `/commissioner/season` tabbed shell and its commissioner authorization pattern (`X-Membership-Id` header + route group filter). The tab=roster content is currently a static placeholder string. The `league_memberships` table already has a nullable `handicap` column (decimal), so no migration is needed.

The roster is always pre-populated by the course admin via SQL before the commissioner accesses this page. The commissioner's only write action is setting or updating a handicap per member.

## Goals / Non-Goals

**Goals:**
- Expose the full active member list for the season via `GET /commissioner/season/roster`
- Allow the commissioner to enter a handicap for members who don't have one via `PATCH /commissioner/season/roster/{leagueMembershipId}/handicap`
- Replace the tab=roster placeholder with a real table that renders in place without a full page reload on handicap save

**Non-Goals:**
- Adding or removing members (course admin concern — out of scope)
- Editing a handicap that is already set via inline input (deferred — see Decisions)
- Handicap as a setup gate — the Roster requirement in `SeasonSetupStatus` checks member count only; this proposal does not touch that logic
- Pagination — member counts per season are small (single digits to low tens)

## Decisions

### Roster tab body: client component fetches its own data

The tab body is a `"use client"` component that fetches `GET /commissioner/season/roster` on mount using the membership ID stored in a prop passed down from the server-rendered page. This avoids making the server component aware of tab-specific data and keeps the fetch close to where the data is displayed.

Alternative considered: server-fetch roster data in `page.tsx` and pass as props. Rejected — it couples unrelated tab data to a single server fetch and adds latency to the initial page render even when the user hasn't navigated to this tab.

### Handicap cell: inline input when null, plain text when set

If `handicap` is null, the cell renders an `<input type="number">` directly. On blur or Enter, the client fires `PATCH` and updates the cell state. If the PATCH succeeds, the cell switches to plain text display.

Editing an already-set handicap (click-to-edit or modal) is deferred. Rationale: the primary use case is initial entry before the season starts. Re-editing is rare enough that a future "edit" affordance (e.g., a pencil icon that reveals an input, or a modal) can be added without breaking the data model.

### PATCH accepts nullable decimal

`PATCH /commissioner/season/roster/{leagueMembershipId}/handicap` body: `{ "handicap": 12.5 }` or `{ "handicap": null }` to clear. This keeps the door open for future "remove handicap" without a separate endpoint.

The membership ID in the path is validated to belong to the active season and the same league as the authenticated commissioner's membership. This prevents a commissioner from patching a membership in a different league.

### Authorization follows existing commissioner pattern

Both new endpoints join the existing `/commissioner` route group, which already validates `X-Membership-Id` and checks `IsCommissioner`. No new auth infrastructure needed.

The `GET /commissioner/season/roster` endpoint reads `SeasonId` from the resolved `ActiveMembership` (already attached to `HttpContext.Items` by the group filter), queries `LeagueMembership` filtered by that season, and returns the list.

The `PATCH` endpoint additionally verifies that the target `leagueMembershipId` belongs to the same season as the commissioner's active membership before updating.

## Risks / Trade-offs

- **Inline input UX is minimal** — there is no explicit save button; save fires on blur/Enter. This could cause accidental saves. → Mitigation: the input shows a loading state during the PATCH and reverts on error with a toast notification. The user can re-enter if needed.
- **No edit path for set handicaps** — a commissioner who entered a wrong value has no in-app way to correct it without a database intervention until a future proposal adds editing. → Mitigation: this is an accepted deferred decision; document clearly in the UI ("To update an existing handicap, contact your league admin" or similar text).
- **Data freshness** — the client fetches roster on tab mount; if another commissioner updates the roster between page load and tab activation, the data could be stale. → Acceptable at MVP given single-commissioner assumption; re-fetch on tab focus if this becomes an issue.
